const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const { auth, admin } = require('../middleware/auth');

// Get all foods (public)
router.get('/', async (req, res) => {
  try {
    const { category, promotion, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (promotion === 'true') {
      filter.isPromotion = true;
      filter.promotionEnd = { $gt: new Date() };
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const foods = await Food.find(filter).sort({ createdAt: -1 });
    res.json(foods);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// Get single food (public)
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ msg: 'Không tìm thấy món ăn' });
    res.json(food);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// Create food (admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const { name, description, price, image, category, isPromotion, promotionPrice, promotionEnd, available } = req.body;

    if (!name || price == null || !category) {
      return res.status(400).json({ msg: 'Vui lòng điền đầy đủ thông tin' });
    }

    const food = new Food({ name, description, price, image, category, isPromotion, promotionPrice, promotionEnd, available });
    await food.save();
    res.status(201).json(food);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// Update food (admin only)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!food) return res.status(404).json({ msg: 'Không tìm thấy món ăn' });
    res.json(food);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// Delete food (admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ msg: 'Không tìm thấy món ăn' });
    res.json({ msg: 'Đã xóa món ăn' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

module.exports = router;
