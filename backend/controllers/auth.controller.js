const User = require('../models/User');
const cryptoUtils = require('../utils/crypto');
const authService = require('../services/auth.service');
const uuid = require('uuid');

/**
 * Registers a new user.
 */
async function register(req, res) {
  try {
    const { email, password, name, phone, gender, date_of_birth } = req.body;
    if (!email || !password || !name || !phone || !gender || !date_of_birth) {
      return res.status(422).json({ detail: "Missing required fields" });
    }

    const emailLower = email.toLowerCase();
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return res.status(400).json({ detail: "Email already registered" });
    }

    const userId = uuid.v4();
    const passwordHash = await cryptoUtils.hashPassword(password);

    const newUser = await User.create({
      id: userId,
      email: emailLower,
      password_hash: passwordHash,
      name,
      phone,
      gender,
      date_of_birth,
      profile_photo: null,
      is_premium: false,
      premium_until: null,
      profile_completed: false,
      created_at: new Date().toISOString(),
      height: null,
      weight: null,
      marital_status: null,
      religion: "Satnami",
      caste: null,
      mother_tongue: null,
      education: null,
      occupation: null,
      income: null,
      city: null,
      state: null,
      country: "India",
      about: null,
      family_type: null,
      father_occupation: null,
      mother_occupation: null,
      siblings: null
    });

    const accessToken = authService.generateAccessToken(userId, emailLower);
    const refreshToken = authService.generateRefreshToken(userId);

    authService.setAuthCookies(res, accessToken, refreshToken);

    const userResponse = newUser.toObject();
    delete userResponse.password_hash;
    delete userResponse._id;

    return res.status(200).json(userResponse);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Authenticates a user.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({ detail: "Missing email or password" });
    }

    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(401).json({ detail: "Invalid credentials" });
    }

    const passwordMatch = await cryptoUtils.verifyPassword(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ detail: "Invalid credentials" });
    }

    const accessToken = authService.generateAccessToken(user.id, emailLower);
    const refreshToken = authService.generateRefreshToken(user.id);

    authService.setAuthCookies(res, accessToken, refreshToken);

    const userResponse = user.toObject();
    delete userResponse.password_hash;
    delete userResponse._id;

    return res.status(200).json(userResponse);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Logs out user by clearing cookies.
 */
function logout(req, res) {
  authService.clearAuthCookies(res);
  return res.status(200).json({ message: "Logged out successfully" });
}

/**
 * Returns authenticated user.
 */
function getMe(req, res) {
  return res.status(200).json(req.user);
}

module.exports = {
  register,
  login,
  logout,
  getMe
};
