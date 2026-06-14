const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  target_id: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['like', 'block'],
    required: true
  },
  created_at: {
    type: String,
    default: () => new Date().toISOString()
  }
}, {
  timestamps: false,
  collection: 'matches'
});

// Prevent duplicate entries: one user can only have one action toward another
MatchSchema.index({ user_id: 1, target_id: 1 }, { unique: true });

module.exports = mongoose.model('Match', MatchSchema);
