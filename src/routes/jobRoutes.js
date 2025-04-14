const express = require("express");
const { validateJob } = require("../middlewares/validator");
const {
  postJob,
  getAllCompanyJobs,
  getCompanyDashboardSummary,
  getJobSeekerStats,
  deleteJobByIdForCompany,
  getAllJobs,
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

router.delete("/delete-job/:id", authenticateUser, deleteJobByIdForCompany);

//jobseeker//
router.get("/get-job-seeker-summary", authenticateUser, getJobSeekerStats);
router.get("/get-random-jobs", getAllJobs);

module.exports = router;
