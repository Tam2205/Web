const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: '' },
  category: {
    type: String,
    enum: ['mon-nhau', 'tra-sua', 'chien', 'pho-bun', 'com', 'mon-an-vat', 'nuoc', 'lau'],
    required: true
  },
  isPromotion: { type: Boolean, default: false },
  promotionPrice: { type: Number, min: 0 },
  promotionEnd: { type: Date },
  available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Food', foodSchema);
