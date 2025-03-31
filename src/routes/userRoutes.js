const express = require("express");
const { updateUserRole } = require("../controllers/userController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const { validateRole } = require("../middlewares/validator");

const router = express.Router();
router.put("/update-role", authenticateUser, validateRole, updateUserRole);

module.exports = router;
