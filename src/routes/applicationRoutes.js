const express = require("express");

const {
  applyForJob,
  getJobApplicationsByJobSeeker,
  getAllJobApplicationsForCompany,
  updateApplicationStatus,
  getJobsForJobSeeker,
} = require("../controllers/applicationController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const {
  validateGetApplications,
  validateGetJobApplicationsForCompany,
} = require("../middlewares/validator");

const router = express.Router();

router.post("/apply/:jobId", authenticateUser, applyForJob);
router.post(
  "/applications/my-applications",
  authenticateUser,
  validateGetApplications,
  getJobApplicationsByJobSeeker
);
router.get("/job-for-you", authenticateUser, getJobsForJobSeeker);

// company section//
router.post(
  "/applications/all-application-startupfounders",
  authenticateUser,
  validateGetJobApplicationsForCompany,
  getAllJobApplicationsForCompany
);

router.put(
  "/applications/:applicationId/status",
  authenticateUser,
  updateApplicationStatus
);

module.exports = router;
