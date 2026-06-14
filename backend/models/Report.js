const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  reporter_id: {
    type: String,
    required: true,
    index: true
  },
  reported_user_id: {
    type: String,
    required: true,
    index: true
  },
  reason: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ""
  },
  created_at: {
    type: String,
    default: () => new Date().toISOString()
  }
}, {
  timestamps: false,
  collection: 'reports'
});

module.exports = mongoose.model('Report', ReportSchema);
