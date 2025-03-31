const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const userId = req.user.id;

    // udate role//
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
