const express = require("express");

const {
  forgotPassword,
  resetPassword,
  verifyResetOtp,
  resendOtp,
} = require("../controllers/passwordController");

const {
  validateForgotPass,
  validatepasswordReset,
  validateOtp,
  validateResendOtp,
} = require("../middlewares/validator");

const router = express.Router();

router.post("/forget-password", validateForgotPass, forgotPassword);
router.post("/reset-password", validatepasswordReset, resetPassword);
router.post("/verify-otp", validateOtp, verifyResetOtp);
router.post("/resend-otp", validateResendOtp, resendOtp);

module.exports = router;
