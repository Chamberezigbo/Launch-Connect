const { body, validationResult, query } = require("express-validator");

// Valaidation for signup//
exports.validateSignup = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

// validation rules for login //
exports.validateLogin = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

// validation rule for forgoten password//
exports.validateForgotPass = [
  body("email").isEmail().withMessage("Invalid email address"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

// validation rule for password reset//
exports.validatepasswordReset = [
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number"),

  body("tempToken").notEmpty().withMessage("Please enter your full name"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

exports.validateProfilelSetup = [
  body("fullName")
    .notEmpty()
    .withMessage("Please enter your full name")
    .matches(/^[a-zA-Z]+ [a-zA-Z]+$/)
    .withMessage("Full name must contain at least two words"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

exports.validateRole = [
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["job_seeker", "startupFounder"])
    .withMessage("Role must be either JOB_SEEKER or Startup founder"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

exports.validateEmail = [
  body("otp").isLength({ min: 4 }).withMessage("otp must be at 4 characters"),
  body("email").isEmail().withMessage("Invalid email address"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

exports.validateResendOtp = [
  body("email").isEmail().withMessage("Invalid email address"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

exports.validateOtp = [
  body("otp").isLength({ min: 4 }).withMessage("otp must be at 4 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

exports.validateProfileInput = [
  body("role").notEmpty().withMessage("Role is required"),
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("roleInCompany")
    .optional()
    .notEmpty()
    .withMessage("Role name is required"),
  body("shortBio")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Short is required and should not exceed 300 characters"),

  body("skills")
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) return true;
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return true;
      } catch (err) {}
      throw new Error("Skills should be an array of strings");
    }),

  body("interests")
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) return true;
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return true;
      } catch (err) {}
      throw new Error("Interests should be an array of strings");
    }),

  body("companyName")
    .optional()
    .notEmpty()
    .withMessage("Company name is required for companies"),
  body("industry")
    .optional()
    .notEmpty()
    .withMessage("Industry is required for companies"),
  body("website").optional().isURL().withMessage("Invalid website URL"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

exports.validateJob = [
  body("title").notEmpty().withMessage("Job title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("responsibilities")
    .notEmpty()
    .withMessage("Responsibilities are required"),
  body("skillsRequired").notEmpty().withMessage("Skills required is required"),
  body("industry").notEmpty().withMessage("Industry is required"),
  body("commitmenLevel").notEmpty().withMessage("Commitment level is required"),
  body("jobType")
    .isIn(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"]) // Adjust based on your enum
    .withMessage("Invalid job type"),
  body("paidRole")
    .isIn(["PAID", "UNPAID"]) // Adjust based on your enum
    .withMessage("Invalid paid role type"),
  body("deadline")
    .isISO8601()
    .toDate()
    .withMessage("Deadline must be a valid date"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

exports.validateGetApplications = [
  query("status")
    .optional()
    .isIn(["PENDING", "ACCEPTED", "REJECTED"])
    .withMessage("Invalid status value"),

  query("industry")
    .optional()
    .isString()
    .trim()
    .withMessage("Industry must be a string"),

  query("jobType")
    .optional()
    .isIn(["FULL_TIME", "PART_TIME", "INTERNSHIP", "REMOTE", "CONTRACT"]) // adjust to match your enum
    .withMessage("Invalid job type"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

exports.validateGetJobApplicationsForCompany = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

// Valaidation for signup//
exports.validateDasPassword = [
  body("oldPassword")
    .isLength({ min: 8 })
    .withMessage("Old Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Old Password must contain a number"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("New Password must contain a number"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];
