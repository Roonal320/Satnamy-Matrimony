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
    
    const isPremium = user.is_premium && user.premium_until && new Date(user.premium_until) > new Date();

    userObj.is_premium = isPremium;
    userObj.premium_plan = isPremium ? user.premium_plan : null;
    userObj.premium_name = isPremium ? user.premium_name : null;
    userObj.premium_until = isPremium ? user.premium_until : null;
    userObj.premium_features = isPremium ? user.premium_features : [];

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
