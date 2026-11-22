const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY, TOKEN_EXPIRATION_DURATION } = require('../constants');

const generateSessionToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET_KEY, { expiresIn: TOKEN_EXPIRATION_DURATION });

// Returns the decoded payload, or null if the token is invalid or expired.
const verifySessionToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET_KEY);
  } catch (err) {
    return null;
  }
};

module.exports = { generateSessionToken, verifySessionToken };
