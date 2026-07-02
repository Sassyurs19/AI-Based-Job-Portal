const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key', {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken
};
