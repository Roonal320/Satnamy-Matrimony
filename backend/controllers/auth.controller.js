const User = require('../models/User');
const cryptoUtils = require('../utils/crypto');
const authService = require('../services/auth.service');
const uuid = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const emailService = require('../services/email.service');
const Otp = require('../models/Otp');
const OtpAttempt = require('../models/OtpAttempt');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Verifies a Google ID token and returns the payload.
 * Also supports access tokens by fetching user info from Google.
 */
async function getGoogleUserInfo(credential) {
  // First, try verifying as an ID token
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (idTokenErr) {
    // If that fails, treat it as an access token and fetch user info
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${credential}` },
      });
      if (!res.ok) {
        throw new Error(`Google userinfo failed with status ${res.status}`);
      }
      const data = await res.json();
      return {
        sub: data.sub,
        email: data.email,
        name: data.name,
        picture: data.picture,
      };
    } catch (accessTokenErr) {
      throw new Error('Failed to verify Google credential: ' + accessTokenErr.message);
    }
  }
}

/**
 * Registers a new user.
 */
async function register(req, res) {
  try {
    const { email, password, name, phone, gender, date_of_birth, otp } = req.body;
    if (!email || !password || !name || !phone || !gender || !date_of_birth || !otp) {
      return res.status(422).json({ detail: "Missing required fields" });
    }

    // Age restriction: must be at least 18 years old
    const dobDate = new Date(date_of_birth);
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    if (dobDate > eighteenYearsAgo) {
      return res.status(400).json({ detail: "User must be at least 18 years old" });
    }

    const emailLower = email.toLowerCase();
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return res.status(400).json({ detail: "Email already registered" });
    }

    // Validate OTP
    const activeOtp = await Otp.findOne({ email: emailLower });
    if (!activeOtp || activeOtp.otp !== otp) {
      return res.status(400).json({ detail: "Invalid or expired verification code" });
    }

    // Delete OTP once verified
    await Otp.deleteOne({ _id: activeOtp._id });

    const userId = uuid.v4();
    const passwordHash = await cryptoUtils.hashPassword(password);

    // Calculate free Gold promo (active until Dec 31, 2026)
    const now = new Date();
    const isPromoActive = now < new Date('2027-01-01T00:00:00Z');
    let isPremium = false;
    let premiumPlan = null;
    let premiumName = null;
    let premiumUntil = null;
    let premiumFeatures = [];

    if (isPromoActive) {
      const gold6Months = new Date();
      gold6Months.setMonth(gold6Months.getMonth() + 6);
      isPremium = true;
      premiumPlan = 'gold_6';
      premiumName = 'Gold';
      premiumUntil = gold6Months.toISOString();
      premiumFeatures = ["unlimited_messaging", "view_contacts", "profile_boost"];
    }

    const newUser = await User.create({
      id: userId,
      email: emailLower,
      password_hash: passwordHash,
      auth_provider: 'local',
      name,
      phone,
      gender,
      date_of_birth,
      profile_photo: null,
      is_premium: isPremium,
      premium_plan: premiumPlan,
      premium_name: premiumName,
      premium_until: premiumUntil,
      premium_features: premiumFeatures,
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
    
    // Respect the actual dynamic fields we saved
    const isUserPremium = userResponse.is_premium && userResponse.premium_until && new Date(userResponse.premium_until) > new Date();
    userResponse.is_premium = isUserPremium;
    userResponse.premium_plan = isUserPremium ? userResponse.premium_plan : null;
    userResponse.premium_name = isUserPremium ? userResponse.premium_name : null;
    userResponse.premium_until = isUserPremium ? userResponse.premium_until : null;
    userResponse.premium_features = isUserPremium ? userResponse.premium_features : [];

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

    // Protect Google-only accounts from password login
    if (user.auth_provider === 'google' && !user.password_hash) {
      return res.status(400).json({
        detail: "This account uses Google Sign-In. Please sign in with Google."
      });
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
    const isPremium = userResponse.is_premium && userResponse.premium_until && new Date(userResponse.premium_until) > new Date();
    userResponse.is_premium = isPremium;
    userResponse.premium_plan = isPremium ? userResponse.premium_plan : null;
    userResponse.premium_name = isPremium ? userResponse.premium_name : null;
    userResponse.premium_until = isPremium ? userResponse.premium_until : null;
    userResponse.premium_features = isPremium ? userResponse.premium_features : [];

    return res.status(200).json(userResponse);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Google Sign-In / Sign-Up entry point.
 * Verifies the Google credential (ID token or access token), then either:
 * - Logs in existing user (by google_id or email match with account linking)
 * - Returns needs_signup=true with google data for new users
 */
async function googleAuth(req, res) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(422).json({ detail: "Missing Google credential" });
    }

    let payload;
    try {
      payload = await getGoogleUserInfo(credential);
    } catch (err) {
      console.error('Google credential verification failed:', err.message);
      return res.status(401).json({ detail: "Invalid Google credential" });
    }

    const { sub: googleId, email, name, picture } = payload;
    const emailLower = email.toLowerCase();

    // Check if user exists by google_id
    let user = await User.findOne({ google_id: googleId });

    // If not found by google_id, try by email (account linking)
    if (!user) {
      user = await User.findOne({ email: emailLower });
      if (user) {
        // Link existing account to Google
        user.google_id = googleId;
        await user.save();
      }
    }

    if (user) {
      // Existing user — log them in
      const accessToken = authService.generateAccessToken(user.id, emailLower);
      const refreshToken = authService.generateRefreshToken(user.id);
      authService.setAuthCookies(res, accessToken, refreshToken);

      const userResponse = user.toObject();
      delete userResponse.password_hash;
      delete userResponse._id;
      const isPremium = userResponse.is_premium && userResponse.premium_until && new Date(userResponse.premium_until) > new Date();
      userResponse.is_premium = isPremium;
      userResponse.premium_plan = isPremium ? userResponse.premium_plan : null;
      userResponse.premium_name = isPremium ? userResponse.premium_name : null;
      userResponse.premium_until = isPremium ? userResponse.premium_until : null;
      userResponse.premium_features = isPremium ? userResponse.premium_features : [];

      return res.status(200).json(userResponse);
    }

    // New user — return data for frontend to collect remaining fields
    return res.status(200).json({
      needs_signup: true,
      google_data: {
        google_id: googleId,
        email: emailLower,
        name: name || '',
        picture: picture || null,
      }
    });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Completes registration for a Google user.
 * Receives the Google credential again (re-verified) + required fields.
 */
async function googleRegister(req, res) {
  try {
    const { credential, phone, gender, date_of_birth } = req.body;
    if (!credential || !phone || !gender || !date_of_birth) {
      return res.status(422).json({ detail: "Missing required fields" });
    }

    // Age restriction: must be at least 18 years old
    const dobDate = new Date(date_of_birth);
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    if (dobDate > eighteenYearsAgo) {
      return res.status(400).json({ detail: "User must be at least 18 years old" });
    }

    let payload;
    try {
      payload = await getGoogleUserInfo(credential);
    } catch (err) {
      console.error('Google credential verification failed:', err.message);
      return res.status(401).json({ detail: "Invalid Google credential" });
    }

    const { sub: googleId, email, name, picture } = payload;
    const emailLower = email.toLowerCase();

    // Check if already registered
    const existing = await User.findOne({
      $or: [{ google_id: googleId }, { email: emailLower }]
    });
    if (existing) {
      return res.status(400).json({ detail: "Account already exists. Please sign in." });
    }

    const userId = uuid.v4();

    // Calculate free Gold promo (active until Dec 31, 2026)
    const now = new Date();
    const isPromoActive = now < new Date('2027-01-01T00:00:00Z');
    let isPremium = false;
    let premiumPlan = null;
    let premiumName = null;
    let premiumUntil = null;
    let premiumFeatures = [];

    if (isPromoActive) {
      const gold6Months = new Date();
      gold6Months.setMonth(gold6Months.getMonth() + 6);
      isPremium = true;
      premiumPlan = 'gold_6';
      premiumName = 'Gold';
      premiumUntil = gold6Months.toISOString();
      premiumFeatures = ["unlimited_messaging", "view_contacts", "profile_boost"];
    }

    const newUser = await User.create({
      id: userId,
      email: emailLower,
      password_hash: null,
      google_id: googleId,
      auth_provider: 'google',
      name: name || 'User',
      phone,
      gender,
      date_of_birth,
      profile_photo: picture || null,
      is_premium: isPremium,
      premium_plan: premiumPlan,
      premium_name: premiumName,
      premium_until: premiumUntil,
      premium_features: premiumFeatures,
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
    
    // Respect the actual dynamic fields we saved
    const isUserPremium = userResponse.is_premium && userResponse.premium_until && new Date(userResponse.premium_until) > new Date();
    userResponse.is_premium = isUserPremium;
    userResponse.premium_plan = isUserPremium ? userResponse.premium_plan : null;
    userResponse.premium_name = isUserPremium ? userResponse.premium_name : null;
    userResponse.premium_until = isUserPremium ? userResponse.premium_until : null;
    userResponse.premium_features = isUserPremium ? userResponse.premium_features : [];

    return res.status(200).json(userResponse);
  } catch (err) {
    console.error('Google register error:', err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Registers a new profile managed by a parent/guardian.
 * No OTP verification required for parent registrations.
 */
async function parentRegister(req, res) {
  try {
    const {
      // Registration info
      registration_type,
      relationship_to_candidate,
      // Guardian/parent contact
      guardian_name,
      guardian_phone,
      guardian_whatsapp,
      guardian_email,
      guardian_city,
      guardian_state,
      // Account credentials (parent's email + password)
      email,
      password,
      // Candidate details
      name,
      gender,
      date_of_birth,
      phone,
    } = req.body;

    // Validate required fields
    if (!registration_type || !relationship_to_candidate || !guardian_name || !guardian_phone) {
      return res.status(422).json({ detail: "Parent/guardian details are required" });
    }
    if (!email || !password) {
      return res.status(422).json({ detail: "Email and password are required for the account" });
    }
    if (!name || !gender || !date_of_birth) {
      return res.status(422).json({ detail: "Candidate name, gender, and date of birth are required" });
    }

    // Age restriction: candidate must be at least 18
    const dobDate = new Date(date_of_birth);
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    if (dobDate > eighteenYearsAgo) {
      return res.status(400).json({ detail: "Candidate must be at least 18 years old" });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({ detail: "Password must be at least 8 characters" });
    }

    const emailLower = email.toLowerCase();
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return res.status(400).json({ detail: "Email already registered" });
    }

    const userId = uuid.v4();
    const passwordHash = await cryptoUtils.hashPassword(password);

    // Calculate free Gold promo (active until Dec 31, 2026)
    const now = new Date();
    const isPromoActive = now < new Date('2027-01-01T00:00:00Z');
    let isPremium = false;
    let premiumPlan = null;
    let premiumName = null;
    let premiumUntil = null;
    let premiumFeatures = [];

    if (isPromoActive) {
      const gold6Months = new Date();
      gold6Months.setMonth(gold6Months.getMonth() + 6);
      isPremium = true;
      premiumPlan = 'gold_6';
      premiumName = 'Gold';
      premiumUntil = gold6Months.toISOString();
      premiumFeatures = ["unlimited_messaging", "view_contacts", "profile_boost"];
    }

    const newUser = await User.create({
      id: userId,
      email: emailLower,
      password_hash: passwordHash,
      auth_provider: 'local',
      name,
      phone: phone || guardian_phone,
      gender,
      date_of_birth,
      profile_photo: null,
      is_premium: isPremium,
      premium_plan: premiumPlan,
      premium_name: premiumName,
      premium_until: premiumUntil,
      premium_features: premiumFeatures,
      profile_completed: false,
      created_at: new Date().toISOString(),
      religion: "Satnami",
      country: "India",
      // Registration type fields
      registration_type,
      relationship_to_candidate,
      // Guardian contact info
      guardian_name,
      guardian_phone,
      guardian_whatsapp: guardian_whatsapp || null,
      guardian_email: guardian_email || null,
      guardian_city: guardian_city || null,
      guardian_state: guardian_state || null,
      // Communication defaults for parent-managed profiles
      preferred_contact_person: relationship_to_candidate,
      preferred_contact_mode: 'Both',
    });

    const accessToken = authService.generateAccessToken(userId, emailLower);
    const refreshToken = authService.generateRefreshToken(userId);
    authService.setAuthCookies(res, accessToken, refreshToken);

    const userResponse = newUser.toObject();
    delete userResponse.password_hash;
    delete userResponse._id;

    const isUserPremium = userResponse.is_premium && userResponse.premium_until && new Date(userResponse.premium_until) > new Date();
    userResponse.is_premium = isUserPremium;
    userResponse.premium_plan = isUserPremium ? userResponse.premium_plan : null;
    userResponse.premium_name = isUserPremium ? userResponse.premium_name : null;
    userResponse.premium_until = isUserPremium ? userResponse.premium_until : null;
    userResponse.premium_features = isUserPremium ? userResponse.premium_features : [];

    return res.status(200).json(userResponse);
  } catch (err) {
    console.error('Parent register error:', err);
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

/**
 * Sends a 6-digit verification OTP to the user's email, rate limited to 5 per hour.
 */
async function sendOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(422).json({ detail: "Email is required" });
    }

    const emailLower = email.toLowerCase();

    // Check if email already exists
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return res.status(400).json({ detail: "Email already registered" });
    }

    // Rate limiting: 5 sends per hour
    const oneHourAgo = new Date(Date.now() - 3600 * 1000);
    const attemptsCount = await OtpAttempt.countDocuments({
      email: emailLower,
      timestamp: { $gt: oneHourAgo }
    });

    if (attemptsCount >= 5) {
      return res.status(429).json({ detail: "Verification limit exceeded. Please try again in 1 hour." });
    }

    // Generate cryptographically secure 6-digit numeric OTP code
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Save to OTP storage (replace active OTP for this email)
    await Otp.deleteMany({ email: emailLower });
    await Otp.create({ email: emailLower, otp });

    // Track the attempt
    await OtpAttempt.create({ email: emailLower });

    // Send email
    const mailResult = await emailService.sendOtpEmail(emailLower, otp);

    const response = { message: "Verification code sent to your email" };
    if (mailResult.fallback && process.env.NODE_ENV !== 'production') {
      response.devOtp = otp;
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Initiates forgot password flow by generating token and sending email.
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(422).json({ detail: "Email is required" });
    }

    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      // Return 200 even if user doesn't exist for security/privacy reasons
      return res.status(200).json({ message: "If this email is registered, you will receive a reset link shortly." });
    }

    if (user.auth_provider === 'google' && !user.password_hash) {
      return res.status(400).json({
        detail: "This account uses Google Sign-In. Please sign in with Google."
      });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const origin = req.get('origin') || 'http://localhost:5173';
    const resetLink = `${origin}/reset-password?token=${token}`;

    const mailResult = await emailService.sendResetPasswordEmail(user.email, user.name, resetLink);

    const response = { message: "If this email is registered, you will receive a reset link shortly." };
    if (mailResult.fallback && process.env.NODE_ENV !== 'production') {
      response.devLink = resetLink;
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Resets user password using reset token.
 */
async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(422).json({ detail: "Token and password are required" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ detail: "Invalid or expired password reset token" });
    }

    const passwordHash = await cryptoUtils.hashPassword(password);
    user.password_hash = passwordHash;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

/**
 * Changes authenticated user's password.
 */
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword) {
      return res.status(422).json({ detail: "New password is required" });
    }

    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }

    // Google-only users setting their first password do not have password_hash
    if (user.password_hash) {
      if (!currentPassword) {
        return res.status(422).json({ detail: "Current password is required" });
      }
      const match = await cryptoUtils.verifyPassword(currentPassword, user.password_hash);
      if (!match) {
        return res.status(400).json({ detail: "Incorrect current password" });
      }
    }

    const passwordHash = await cryptoUtils.hashPassword(newPassword);
    user.password_hash = passwordHash;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error" });
  }
}

module.exports = {
  register,
  login,
  googleAuth,
  googleRegister,
  parentRegister,
  logout,
  getMe,
  sendOtp,
  forgotPassword,
  resetPassword,
  changePassword
};
