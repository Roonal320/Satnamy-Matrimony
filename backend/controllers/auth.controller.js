const User = require('../models/User');
const cryptoUtils = require('../utils/crypto');
const authService = require('../services/auth.service');
const uuid = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const emailService = require('../services/email.service');

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
      auth_provider: 'local',
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
    console.error('Google register error:', err);
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
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword
};
