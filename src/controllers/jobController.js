const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.postJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      responsibilities,
      skillsRequired,
      industry,
      paidRole,
      deadline,
      commitmenLevel,
      location,
      jobType,
    } = req.body;

    const companyId = req.user.id; // Assuming user is authenticated and is a company
    const newJob = await prisma.job.create({
      data: {
        title,
        description,
        responsibilities,
        skillsRequired,
        industry,
        paidRole,
        deadline,
        commitmenLevel,
        location,
        jobType,
        company: {
          connect: { id: companyId },
        },
      },
    });

    res.status(201).json({ message: "Job posted successfully", job: newJob });
  } catch (error) {
    next(error);
  }
};
