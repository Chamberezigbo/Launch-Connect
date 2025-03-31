const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const { sendEmail } = require("../service/emailTrasporter");
const verifyEmailTemplate = require("../templates/resetPasswordTemplate");
const generateOtp = require("../utils/generateOtp");
const FRONTEND_URL = process.env.FRONTEND_URL;

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

exports.signupUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // check if user email exist//
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "Email Already Exist" });
    }

    // Hash the password//
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate reset token
    const { otp, expiry } = generateOtp(); // Default 15 min expiry

    // Create user//
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        resetToken: otp,
        resetTokenExpiry: expiry,
      },
    });

    // Generate reset link//
    const resetLink = `${FRONTEND_URL}/verify-email?otp=${otp}`;

    //  Send reset password email//
    const emailMessage = "Verify Your Email";
    const emailHTML = verifyEmailTemplate(
      user.email,
      resetLink,
      emailMessage,
      expiry
    );
    await sendEmail(user.email, emailMessage, emailHTML);

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Signup successful! Please verify your email. Check your inbox",
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { otp, email } = req.body;

    // Find user by reset token
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid User or OTP" });

    // Step 2: Check if OTP is correct and not expired
    if (!user.resetToken || user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    if (user.resetToken !== otp) {
      return res.status(400).json({ error: "Incorrect OTP" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, resetToken: null },
    });
    res.status(200).json({
      message:
        "Email verified successfully! Please proceed to set up your profile.",
    });
  } catch (error) {
    next(error);
  }
};

exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    // check if user exist //
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Step 2: Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    // Generate reset token
    const { otp, expiry } = generateOtp(); // Default 15 min expiry

    // Step 4: Update OTP in the database
    await prisma.user.update({
      where: { email },
      data: { resetToken: otp, resetTokenExpiry: expiry },
    });

    // Generate reset link//
    const resetLink = `${FRONTEND_URL}/verify-email?otp=${otp}`;

    //  Send reset password email//
    const emailMessage = "Verify Your Email";
    const emailHTML = verifyEmailTemplate(
      user.email,
      resetLink,
      emailMessage,
      expiry
    );
    await sendEmail(user.email, emailMessage, emailHTML);
    res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email.",
    });
  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // find user by email//
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Check if email is varified
    if (!user.isVerified) {
      // Generate new OTP
      const { otp, expiry } = generateOtp(); // Default 15 min expiry

      // Update user with new OTP
      await prisma.user.update({
        where: { email },
        data: { resetToken: otp, resetTokenExpiry: expiry },
      });

      // Send new OTP email
      const verifyLink = `${process.env.FRONTEND_URL}/verify-email?otp=${otp}`;
      const emailMessage = "Verify Your Email";
      const emailHTML = verifyEmailTemplate(
        user.email,
        verifyLink,
        emailMessage,
        expiry
      );
      await sendEmail(user.email, emailMessage, emailHTML);

      return res.status(403).json({
        success: false,
        message: "Email not verified. A new verification code has been sent.",
        redirectTo: "/verify-email", // Frontend should navigate user here
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Check if role is set
    if (!user.role) {
      return res.status(400).json({
        success: false,
        message: "Role not set. Please select a role to continue.",
        redirectTo: "/select-role", // Frontend should navigate user here
        token,
      });
    }

    res
      .status(200)
      .json({ message: "Login successful", token, redirectTo: "/dashboard" });
  } catch (error) {
    next(error);
  }
};

exports.googlAuth = async (req, res, next) => {
  try {
    // Extract user and token from passport
    const { user, token } = req.user;

    res.status(200).json({
      success: true,
      message: "Google Login Successful",
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.testendpoint = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "This server is up and runing",
    });
  } catch (error) {
    console.log(error);
  }
};
