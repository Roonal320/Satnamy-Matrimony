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
    default: false
  },
  premium_plan: {
    type: String,
    default: null
  },
  premium_name: {
    type: String,
    default: null
  },
  premium_features: {
    type: [String],
    default: []
  },
  premium_until: {
    type: String,
    default: null
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

  // ── Registration Type ──
  registration_type: {
    type: String,
    enum: ['self', 'parent', 'sibling', 'relative'],
    default: 'self'
  },
  hidden_fields: {
    type: [String],
    default: []
  },
  relationship_to_candidate: {
    type: String,
    default: null
  },

  // ── Parent/Guardian Contact Info ──
  guardian_name: { type: String, default: null },
  guardian_phone: { type: String, default: null },
  guardian_whatsapp: { type: String, default: null },
  guardian_email: { type: String, default: null },
  guardian_city: { type: String, default: null },
  guardian_state: { type: String, default: null },
  guardian_photo: { type: String, default: null },

  // ── Additional Candidate Details ──
  manglik: { type: String, default: null },
  highest_degree: { type: String, default: null },
  college_name: { type: String, default: null },
  company_name: { type: String, default: null },
  native_place: { type: String, default: null },

  // ── Enhanced Family Details ──
  father_name: { type: String, default: null },
  mother_name: { type: String, default: null },
  num_brothers: { type: String, default: null },
  num_sisters: { type: String, default: null },
  family_values: { type: String, default: null },

  // ── Religion & Community (enhanced) ──
  guru_ghar: { type: String, default: null },
  gotra: { type: String, default: null },

  // ── Lifestyle ──
  diet: { type: String, default: null },
  smoking: { type: String, default: null },
  drinking: { type: String, default: null },

  // ── Partner Preferences ──
  partner_age_min: { type: Number, default: null },
  partner_age_max: { type: Number, default: null },
  partner_height_min: { type: String, default: null },
  partner_height_max: { type: String, default: null },
  partner_education: { type: String, default: null },
  partner_occupation: { type: String, default: null },
  partner_state: { type: String, default: null },
  partner_city: { type: String, default: null },
  partner_marital_status: { type: String, default: null },
  partner_manglik: { type: String, default: null },

  // ── Communication Preferences ──
  preferred_contact_person: { type: String, default: null },
  preferred_contact_time: { type: String, default: null },
  preferred_contact_mode: { type: String, default: null },

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
