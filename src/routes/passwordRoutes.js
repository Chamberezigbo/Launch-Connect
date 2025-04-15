const express = require("express");

const {
  forgotPassword,
  resetPassword,
  verifyResetOtp,
  resendOtp,
  dashResetPassword,
} = require("../controllers/passwordController");

const {
  validateForgotPass,
  validatepasswordReset,
  validateOtp,
  validateResendOtp,
  validateDasPassword,
} = require("../middlewares/validator");

const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/forget-password", validateForgotPass, forgotPassword);
router.post("/reset-password", validatepasswordReset, resetPassword);
router.post("/verify-otp", validateOtp, verifyResetOtp);
router.post("/resend-otp", validateResendOtp, resendOtp);
router.post(
  "/dash-reset-password",
  authenticateUser,
  validateDasPassword,
  dashResetPassword
);

module.exports = router;
