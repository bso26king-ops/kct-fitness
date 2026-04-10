const jwt = require('jsonwebtoken');

/**
 * Generate a JWT access token
 * @param {string} userId - User ID
 * @returns {string} - Access token
 */
const generateAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

/**
 * Generate a JWT refresh token
 * @param {string} userId - User ID
 * @returns {string} - Refresh token
 */
const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

/**
 * Verify an access token
 * @param {string} token - Access token
 * @returns {object} - Decoded payload
 * @throws {Error} - If token is invalid
 */
const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

/**
 * Verify a refresh token
 * @param {string} token - Refresh token
 * @returns {object} - Decoded payload
 * @throws {Error} - If token is invalid
 */
const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
