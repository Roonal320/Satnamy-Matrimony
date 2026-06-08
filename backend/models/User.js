const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password_hash: {
    type: String,
    required: false,
    default: null
  },
  google_id: {
    type: String,
    default: null,
    index: true
  },
  auth_provider: {
    type: String,
    default: "local"
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  date_of_birth: {
    type: String,
    required: true
  },
  profile_photo: {
    type: String,
    default: null
  },
  is_premium: {
    type: Boolean,
    default: true,
    get: () => true
  },
  premium_plan: {
    type: String,
    default: 'platinum_12',
    get: () => 'platinum_12'
  },
  premium_name: {
    type: String,
    default: 'Platinum',
    get: () => 'Platinum'
  },
  premium_features: {
    type: [String],
    default: [],
    get: () => [
      'Unlimited Messaging',
      'View Contact Details',
      'Profile Boost (Unlimited)',
      'Bold Listing in Search',
      'Top Spotlight Profile',
      'Personal Matchmaker',
      'Priority Support 24/7'
    ]
  },
  premium_until: {
    type: String,
    default: null,
    get: () => new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
  },
  profile_completed: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: String,
    default: () => new Date().toISOString()
  },
  height: {
    type: String,
    default: null
  },
  weight: {
    type: String,
    default: null
  },
  marital_status: {
    type: String,
    default: null
  },
  religion: {
    type: String,
    default: "Satnami"
  },
  caste: {
    type: String,
    default: null
  },
  mother_tongue: {
    type: String,
    default: null
  },
  education: {
    type: String,
    default: null
  },
  occupation: {
    type: String,
    default: null
  },
  income: {
    type: String,
    default: null
  },
  city: {
    type: String,
    default: null
  },
  state: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: "India"
  },
  about: {
    type: String,
    default: null
  },
  family_type: {
    type: String,
    default: null
  },
  father_occupation: {
    type: String,
    default: null
  },
  mother_occupation: {
    type: String,
    default: null
  },
  siblings: {
    type: String,
    default: null
  },
  role: {
    type: String,
    default: "user"
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: false,
  collection: 'users',
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model('User', UserSchema);
