const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { sendEmail } = require("../service/emailTrasporter");
const resetPasswordTemplate = require("../templates/resetPasswordTemplate");
const { send } = require("process");
const generateOtp = require("../utils/generateOtp");
const exp = require("constants");

const prisma = new PrismaClient();
const FRONTEND_URL = process.env.FRONTEND_URL;

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate reset token
    const { otp, expiry } = generateOtp(); // Default 15 min expiry

    // Save user token to expire
    await prisma.user.update({
      where: { email },
      data: { resetToken: otp, resetTokenExpiry: expiry },
    });

    // Generate reset link//
    const resetLink = `${FRONTEND_URL}/reset-password?token=${otp}`;

    //  Send reset password email//
    const emailMessage = "Resest Your Password";
    const emailHTML = resetPasswordTemplate(
      user.email,
      resetLink,
      emailMessage,
      expiry
    );
    await sendEmail(user.email, emailMessage, emailHTML);

    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    next(error);
  }
};

exports.verifyResetOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;

    // Check if OTP is valid
    const user = await prisma.user.findFirst({
      where: { resetToken: otp, resetTokenExpiry: { gt: new Date() } },
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired OTP" });

    // Generate temporary token (valid for a short time)
    const tempToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" } // Only valid for 10 minutes
    );

    res.json({
      message: "OTP verified. Proceed to reset password.",
      tempToken,
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { tempToken, newPassword } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Find user by decoded user ID
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    // hash new password//
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password & clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};

exports.dashResetPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // assuming authenticated user from middleware

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: "Password updated successfully" });
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

    // Generate reset token
    const { otp, expiry } = generateOtp(); // Default 15 min expiry

    // Step 4: Update OTP in the database
    await prisma.user.update({
      where: { email },
      data: { resetToken: otp, resetTokenExpiry: expiry },
    });

    // Generate reset link//
    const resetLink = `Go and enter this OTP to reset your password: ${otp}`;
    const emailMessage =
      "Thank you for signing up on Lunch Connect! To complete your registration, please verify your email address.";
    const emailHTML = resetPasswordTemplate(
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
