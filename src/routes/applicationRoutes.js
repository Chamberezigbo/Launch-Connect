const express = require("express");

const {
  applyForJob,
  getJobApplicationsByJobSeeker,
  getAllJobApplicationsForCompany,
  updateApplicationStatus,
  getJobsForJobSeeker,
  getJobWithApplicants,
  getJobByIdForJobSeeker,
} = require("../controllers/applicationController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const {
  validateGetApplications,
  validateGetJobApplicationsForCompany,
} = require("../middlewares/validator");

const router = express.Router();

router.post("/apply/:jobId", authenticateUser, applyForJob);
router.get(
  "/applications/my-applications",
  authenticateUser,
  validateGetApplications,
  getJobApplicationsByJobSeeker
);
router.get("/job-for-you", authenticateUser, getJobsForJobSeeker);
router.get("/singlejob/:id", authenticateUser, getJobByIdForJobSeeker);

// company section//
router.get(
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

router.get("/single-job/:jobid", authenticateUser, getJobWithApplicants);

module.exports = router;
