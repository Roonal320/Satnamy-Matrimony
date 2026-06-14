const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  sender_id: {
    type: String,
    required: true,
    index: true
  },
  receiver_id: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  // Legacy field — kept for backward compat with old documents
  read: {
    type: Boolean,
    default: false
  },
  // New delivery status: 'sent' → 'delivered' → 'read'
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  edited: {
    type: Boolean,
    default: false
  },
  edited_at: {
    type: String,
    default: null
  },
  deleted: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: String,
    default: () => new Date().toISOString()
  }
}, {
  timestamps: false,
  collection: 'messages'
});

module.exports = mongoose.model('Message', MessageSchema);
