const express = require("express");
const { validateJob } = require("../middlewares/validator");
const { postJob } = require("../controllers/jobController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/post-job", authenticateUser, validateJob, postJob);

module.exports = router;
