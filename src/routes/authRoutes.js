const express = require("express");

const {
  signupUser,
  loginUser,
  googlAuth,
  testendpoint,
  verifyEmail,
  resendOtp,
} = require("../controllers/authController");
const {
  validateSignup,
  validateLogin,
  validateEmail,
  validateResendOtp,
} = require("../middlewares/validator");
const passport = require("../config/passport");

const router = express.Router();

router.post("/signup", validateSignup, signupUser);
router.post("/email-verify", validateEmail, verifyEmail);
router.post("/resend-otp", validateResendOtp, resendOtp);
router.post("/login", validateLogin, loginUser);
router.get("/test", testendpoint);

// Google OAuth for Companies
router.get(
  "/google/signup",
  passport.authenticate({ scope: ["profile", "email"] })
);

// Google OAuth Callback for Companies
router.get(
  "/google/callback",
  passport.authenticate({ session: false }),
  googlAuth
);

module.exports = router;
