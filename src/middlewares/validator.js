const { body, validationResult } = require("express-validator");

// Valaidation for signup//
exports.validateSignup = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
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
    .withMessage("Password must be at least 6 characters")
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
