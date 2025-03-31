const express = require("express");
const { authenticateUser } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const { setupProfile } = require("../controllers/profileController");
const { validateProfileInput } = require("../middlewares/validator");

const router = express.Router();

router.post(
  "/setup-profile",
  authenticateUser,
  upload.single("resume"),
  validateProfileInput,
  setupProfile
);

module.exports = router;
