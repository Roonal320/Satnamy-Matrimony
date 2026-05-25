const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  order_id: {
    type: String,
    required: true,
    unique: true
  },
  plan: {
    type: String,
    required: true
  },
  plan_name: {
    type: String,
    required: true
  },
  months: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: "created"
  },
  frontend_url: {
    type: String,
    default: null
  },
  payment_id: {
    type: String,
    default: null
  },
  error: {
    type: String,
    default: null
  },
  error_message: {
    type: String,
    default: null
  },
  created_at: {
    type: String,
    default: () => new Date().toISOString()
  }
}, {
  timestamps: false,
  collection: 'orders'
});

module.exports = mongoose.model('Order', OrderSchema);
