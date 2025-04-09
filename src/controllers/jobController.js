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

exports.getJobSeekerStats = async (req, res, next) => {
  try {
    const jobSeekerId = req.user.id; // Get the job seeker ID from the authenticated user

    // Fetch the job seeker data
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { id: jobSeekerId },
    });

    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found" });
    }

    // Calculate the total number of job applications
    const totalApplications = await prisma.jobApplication.count({
      where: { jobSeekerId },
    });

    // Calculate the number of job applications with "ACCEPTED" status
    const acceptedApplications = await prisma.jobApplication.count({
      where: { jobSeekerId, status: "ACCEPTED" },
    });

    // Calculate the number of job applications with "PENDING" status
    const pendingApplications = await prisma.jobApplication.count({
      where: { jobSeekerId, status: "PENDING" },
    });

    // Calculate the number of job applications under review (assuming review status can be marked as pending or awaiting review)
    const pendingReviews = await prisma.jobApplication.count({
      where: { jobSeekerId, status: "PENDING" },
    });

    return res.json({
      totalApplications,
      acceptedApplications,
      pendingApplications,
      pendingReviews,
    });
  } catch (error) {
    next(error);
  }
};

// GET /company/jobs?page=1&pageSize=10
exports.getAllCompanyJobs = async (req, res, next) => {
  try {
    const companyId = req.user.id; // From JWT
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    // Total count
    const total = await prisma.job.count({
      where: { companyId },
    });

    const jobs = await prisma.job.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    });

    return res.status(200).json({
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      jobs,
      message: jobs.length === 0 ? "No jobs posted yet" : undefined,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCompanyDashboardSummary = async (req, res, next) => {
  try {
    const companyId = req.user.id; // Company ID from logged-in user

    // Total job posts by the company
    const totalJobPosts = await prisma.job.count({
      where: { companyId },
    });

    // Active jobs (deadline is in the future)
    const activeJobs = await prisma.job.count({
      where: {
        companyId,
        deadline: {
          gt: new Date(), // future deadline
        },
      },
    });

    // Pending application reviews for this company's jobs
    const pendingReviews = await prisma.jobApplication.count({
      where: {
        job: {
          companyId,
        },
        status: "PENDING",
      },
    });

    res.status(200).json({
      totalJobPosts,
      activeJobs,
      pendingReviews,
    });
  } catch (error) {
    next(error);
  }
};
