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
  read: {
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
