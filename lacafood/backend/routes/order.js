const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, admin } = require('../middleware/auth');

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items, total, paymentMethod, address, phone } = req.body;

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
      phone
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
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
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
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// Update order status (admin)
router.put('/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Trạng thái không hợp lệ' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email phone');

    if (!order) return res.status(404).json({ msg: 'Không tìm thấy đơn hàng' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

module.exports = router;
