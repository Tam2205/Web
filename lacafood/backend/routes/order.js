const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { auth, admin, shipper } = require('../middleware/auth');

// Auto-assign shipper: pick random shipper who is not currently delivering
const assignShipper = async () => {
  const allShippers = await User.find({ role: 'shipper' }).select('_id name');
  if (allShippers.length === 0) return null;

  const busyShipperIds = await Order.distinct('shipper', { status: 'delivering', shipper: { $ne: null } });
  const availableShippers = allShippers.filter(s => !busyShipperIds.some(id => id.toString() === s._id.toString()));

  if (availableShippers.length === 0) return null;
  return availableShippers[Math.floor(Math.random() * availableShippers.length)];
};

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items, total, paymentMethod, address, phone, distance, shippingFee, deliveryLat, deliveryLng } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ msg: 'Giỏ hàng trống' });
    }
    if (!address || !phone) {
      return res.status(400).json({ msg: 'Vui lòng điền địa chỉ và số điện thoại' });
    }

    const order = new Order({
      user: req.user.id,
      items,
      total,
      paymentMethod,
      address,
      phone,
      distance: distance || 0,
      shippingFee: shippingFee || 0,
      deliveryLat: deliveryLat || null,
      deliveryLng: deliveryLng || null
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('shipper', 'name phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// Get shipper's assigned orders
router.get('/shipper-orders', auth, shipper, async (req, res) => {
  try {
    const orders = await Order.find({ shipper: req.user.id })
      .populate('user', 'name phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// Shipper confirms delivery complete
router.put('/:id/complete', auth, shipper, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Không tìm thấy đơn hàng' });
    if (order.shipper.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Bạn không được phân công đơn này' });
    }
    if (order.status !== 'delivering') {
      return res.status(400).json({ msg: 'Đơn hàng chưa ở trạng thái đang giao' });
    }

    order.status = 'completed';
    await order.save();

    const populated = await Order.findById(order._id).populate('user', 'name phone');
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// Get all orders (admin)
router.get('/', auth, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('shipper', 'name phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// Get all shippers (admin)
router.get('/shippers', auth, admin, async (req, res) => {
  try {
    const shippers = await User.find({ role: 'shipper' }).select('-password');
    // Count active deliveries per shipper
    const result = await Promise.all(shippers.map(async (s) => {
      const activeCount = await Order.countDocuments({ shipper: s._id, status: 'delivering' });
      const completedCount = await Order.countDocuments({ shipper: s._id, status: 'completed' });
      return { ...s.toObject(), activeDeliveries: activeCount, completedDeliveries: completedCount };
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// Create shipper account (admin)
router.post('/shippers', auth, admin, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Vui lòng điền đầy đủ thông tin' });
    }

    const bcrypt = require('bcryptjs');
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email đã được sử dụng' });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const shipperUser = new User({ name, email, password: hashedPassword, phone, role: 'shipper' });
    await shipperUser.save();

    const { password: _, ...shipperData } = shipperUser.toObject();
    res.status(201).json(shipperData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// Delete shipper (admin)
router.delete('/shippers/:id', auth, admin, async (req, res) => {
  try {
    const shipperUser = await User.findById(req.params.id);
    if (!shipperUser || shipperUser.role !== 'shipper') {
      return res.status(404).json({ msg: 'Không tìm thấy shipper' });
    }
    const activeOrders = await Order.countDocuments({ shipper: req.params.id, status: 'delivering' });
    if (activeOrders > 0) {
      return res.status(400).json({ msg: 'Shipper đang có đơn giao, không thể xóa' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Đã xóa shipper' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// Update order status (admin) - auto-assign shipper when status changes to 'delivering'
router.put('/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Trạng thái không hợp lệ' });
    }

    const updateData = { status };

    // Auto-assign shipper when changing to 'delivering'
    if (status === 'delivering') {
      const order = await Order.findById(req.params.id);
      if (order && !order.shipper) {
        const assignedShipper = await assignShipper();
        if (assignedShipper) {
          updateData.shipper = assignedShipper._id;
        }
      }
    }

    // If cancelled or back from delivering, unassign shipper
    if (status === 'cancelled') {
      updateData.shipper = null;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'name email phone').populate('shipper', 'name phone');

    if (!order) return res.status(404).json({ msg: 'Không tìm thấy đơn hàng' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

module.exports = router;
