const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    note: { type: String, default: '' }
  }],
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cod', 'qr'], required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'],
    default: 'pending'
  },
  address: { type: String, required: true },
  phone: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
