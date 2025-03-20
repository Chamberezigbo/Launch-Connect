const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const { sendEmail } = require("../service/emailTrasporter");
const resetPasswordTemplate = require("../templates/resetPasswordTemplate");
const { send } = require("process");

const prisma = new PrismaClient();
const FRONTEND_URL = process.env.FRONTEND_URL;

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

    // Save user token to expire
    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    // Generate reset link//
    const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    //  Send reset password email//
    const emailMessage = "Resest Your Password";
    const emailHTML = resetPasswordTemplate(
      user.email,
      resetLink,
      emailMessage,
      resetTokenExpiry
    );
    await sendEmail(user.email, emailMessage, emailHTML);

    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });
    if (!user)
      return res.status(400).json({ error: "invalid or expired token" });

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
