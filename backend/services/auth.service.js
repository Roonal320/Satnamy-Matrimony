const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';

/**
 * Generate a JWT access token valid for 24 hours.
 */
function generateAccessToken(userId, email) {
  return jwt.sign(
    { sub: userId, email: email, type: 'access' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Generate a JWT refresh token valid for 7 days.
 */
function generateRefreshToken(userId) {
  return jwt.sign(
    { sub: userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify a JWT token.
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Sets authorization cookies on HTTP response.
 */
function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: false, // matches server.py secure=False
    sameSite: 'lax',
    maxAge: 86400 * 1000, // 24 hours in ms
    path: '/'
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 604800 * 1000, // 7 days in ms
    path: '/'
  });
}

/**
 * Clears authorization cookies.
 */
function clearAuthCookies(res) {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/' });
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  setAuthCookies,
  clearAuthCookies
};
