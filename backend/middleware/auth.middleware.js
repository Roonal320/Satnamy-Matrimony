const User = require('../models/User');
const authService = require('../services/auth.service');

/**
 * Authentication check middleware.
 * Verifies the access token cookie or bearer auth header,
 * loads user, and attaches it to req.user.
 */
async function authenticate(req, res, next) {
  let token = req.cookies.access_token;
  if (!token) {
    const authHeader = req.headers.authorization || "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    return res.status(401).json({ detail: "Not authenticated" });
  }

  try {
    const decoded = authService.verifyToken(token);
    if (decoded.type !== 'access') {
      return res.status(401).json({ detail: "Invalid token type" });
    }

    const user = await User.findOne({ id: decoded.sub });
    if (!user) {
      return res.status(401).json({ detail: "User not found" });
    }

    const userObj = user.toObject();
    delete userObj.password_hash;
    delete userObj._id;
    
    // Explicitly force premium launch promotion attributes
    userObj.is_premium = true;
    userObj.premium_plan = 'platinum_12';
    userObj.premium_name = 'Platinum';
    userObj.premium_until = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
    userObj.premium_features = [
      'Unlimited Messaging',
      'View Contact Details',
      'Profile Boost (Unlimited)',
      'Bold Listing in Search',
      'Top Spotlight Profile',
      'Personal Matchmaker',
      'Priority Support 24/7'
    ];

    req.user = userObj;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ detail: "Token expired" });
    }
    return res.status(401).json({ detail: "Invalid token" });
  }
}

module.exports = {
  authenticate
};
