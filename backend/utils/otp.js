const crypto = require('crypto');

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Hash OTP for storage
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

// Verify OTP
const verifyOTP = (inputOTP, storedHash) => {
  const inputHash = hashOTP(inputOTP);
  return inputHash === storedHash;
};

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTP
};
