const express = require("express");
const { validateJob } = require("../middlewares/validator");
const {
  postJob,
  getAllCompanyJobs,
  getCompanyDashboardSummary,
  getJobSeekerStats,
} = require("../controllers/jobController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/post-job", authenticateUser, validateJob, postJob);
router.get("/jobs", authenticateUser, getAllCompanyJobs);
router.get(
  "/get-startup-dashboard-summary",
  authenticateUser,
  getCompanyDashboardSummary
);

//jobseeker//
router.get("/get-job-seeker-summary", authenticateUser, getJobSeekerStats);

module.exports = router;
