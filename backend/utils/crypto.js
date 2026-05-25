const bcrypt = require('bcryptjs');

/**
 * Hash a plain text password.
 * @param {string} password - The plain text password.
 * @returns {Promise<string>} The hashed password.
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * Compare a plain text password with a hash.
 * @param {string} plainPassword - The plain text password.
 * @param {string} hashedPassword - The hashed password.
 * @returns {Promise<boolean>} True if matching, otherwise false.
 */
async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
  hashPassword,
  verifyPassword
};
