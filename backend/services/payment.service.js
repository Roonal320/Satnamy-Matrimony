const crypto = require('crypto');

/**
 * Generate a SHA512 hash for PayU order creation.
 */
function generateOrderHash({ key, txnid, amount, productinfo, firstname, email, salt }) {
  const udf1 = "";
  const udf2 = "";
  const udf3 = "";
  const udf4 = "";
  const udf5 = "";

  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
  return crypto.createHash('sha512').update(hashString).digest('hex').toLowerCase();
}

/**
 * Verify a callback SHA512 hash returned by PayU redirect.
 */
function verifyCallbackHash({ salt, status, email, firstname, productinfo, amount, txnid, key, returnedHash, body }) {
  const udf1 = body.udf1 || "";
  const udf2 = body.udf2 || "";
  const udf3 = body.udf3 || "";
  const udf4 = body.udf4 || "";
  const udf5 = body.udf5 || "";

  const hashString = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex').toLowerCase();

  return calculatedHash === returnedHash;
}

module.exports = {
  generateOrderHash,
  verifyCallbackHash
};
