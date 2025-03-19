const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClint } = require("prisma");

const prisma = new PrismaClint();
const SECRET_KEY = process.env.JWT_SECRET;

exports.signupUser = async (req, res, next) => {
  try {
    const { email, fullName, password } = req.body;

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

    // Create user//
    const user = await prisma.user.create({
      data: { email, fullname, role, password: hashedPassword },
    });

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "User registration successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
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

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ message: "Login successful", token });
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
        fullName: user.fullName,
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
