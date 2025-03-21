const generateOtp = (expiryMinutes = 15) => {
  return {
    otp: Math.floor(1000 + Math.random() * 9000).toString(),
    expiry: new Date(Date.now() + expiryMinutes * 60 * 1000),
  };
};
module.exports = generateOtp;
