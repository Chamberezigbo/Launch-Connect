const express = require("express");

const {
  forgotPassword,
  resetPassword,
} = require("../controllers/passwordController");

const {
  validateForgotPass,
  validatepasswordReset,
} = require("../middlewares/validator");

const router = express.Router();

router.post("/forget-password", validateForgotPass, forgotPassword);
router.post("/reset-password", validatepasswordReset, resetPassword);

module.exports = router;
