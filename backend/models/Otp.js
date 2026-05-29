const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now,
    expires: 600 // Expires in 10 minutes
  }
}, {
  timestamps: false,
  collection: 'otps'
});

module.exports = mongoose.model('Otp', OtpSchema);
