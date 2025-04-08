const express = require("express");
const { authenticateUser } = require("../middlewares/authMiddleware");
const { upload, logoUpload } = require("../middlewares/upload");
const {
  setupProfile,
  upupdateJobSeekerProfile,
  editCompanyProfile,
} = require("../controllers/profileController");
const { validateProfileInput } = require("../middlewares/validator");

const router = express.Router();

router.post(
  "/setup-profile",
  authenticateUser,
  upload.single("resume"),
  validateProfileInput,
  setupProfile
);

router.patch(
  "/update-profile-jobseeker",
  authenticateUser,
  upload.single("resume"),
  upupdateJobSeekerProfile
);

router.patch(
  "/update-profile-startupfounders",
  authenticateUser,
  logoUpload.single("companyLogo"),
  editCompanyProfile
);

module.exports = router;
