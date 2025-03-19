const express = require("express");

const {
  signupUser,
  loginUser,
  googlAuth,
  testendpoint,
} = require("../controllers/authController");
const { validateSignup, validateLogin } = require("../middlewares/validator");
const passport = require("../config/passport");

const router = express.Router();

router.post("/signup", validateSignup, signupUser);
router.post("/login", validateLogin, loginUser);
router.get("/test", testendpoint);

// Google OAuth for Job Seekers
router.get(
  "/google/job-seeker",
  passport.authenticate("google-job-seeker", { scope: ["profile", "email"] })
);

// Google OAuth Callback for Job Seekers
router.get(
  "/google/job-seeker/callback",
  passport.authenticate("google-job-seeker", { session: false }),
  googlAuth
);

// Google OAuth for Companies
router.get(
  "/google/company",
  passport.authenticate("google-company", { scope: ["profile", "email"] })
);

// Google OAuth Callback for Companies
router.get(
  "/google/company/callback",
  passport.authenticate("google-company", { session: false }),
  googlAuth
);

module.exports = router;
