const mongoose = require('mongoose');

const OtpAttemptSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 3600 // Expires in 1 hour
  }
}, {
  timestamps: false,
  collection: 'otp_attempts'
});

module.exports = mongoose.model('OtpAttempt', OtpAttemptSchema);
