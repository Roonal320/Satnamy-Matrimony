const mongoose = require('mongoose');

const ViewSchema = new mongoose.Schema({
  viewer_id: {
    type: String,
    required: true
  },
  viewed_id: {
    type: String,
    required: true
  },
  timestamp: {
    type: String,
    default: () => new Date().toISOString()
  }
}, {
  timestamps: false,
  collection: 'views'
});

// Compound index to ensure uniqueness per viewer/viewed combination
ViewSchema.index({ viewer_id: 1, viewed_id: 1 }, { unique: true });
ViewSchema.index({ viewed_id: 1 });

module.exports = mongoose.model('View', ViewSchema);
