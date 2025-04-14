const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.applyForJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const jobSeekerId = req.user.id; // User ID from JWT, assumed to be a job seeker

    // Check if job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if user has a job seeker profile
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { id: jobSeekerId },
    });
    if (!jobSeeker) {
      return res
        .status(403)
        .json({ message: "You must complete your job seeker profile first" });
    }

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findFirst({
      where: { jobId, jobSeekerId },
    });

    if (existingApplication) {
      return res
        .status(409)
        .json({ message: "You have already applied for this job" });
    }

    // Create the application
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        jobSeekerId,
        status: "PENDING",
      },
    });

    res.status(201).json({ message: "Application submitted", application });
  } catch (error) {
    next(error);
  }
};

exports.getJobApplicationsByJobSeeker = async (req, res, next) => {
  try {
    const jobSeekerId = req.user.id;
    const {
      status,
      industry,
      title,
      jobType,
      page = 1,
      limit = 10,
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Check if job seeker exists
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { id: jobSeekerId },
    });

    if (!jobSeeker) {
      return res.status(403).json({
        message: "Complete your job seeker profile to view applications.",
      });
    }

    // Build filters for applications
    const filters = {
      jobSeekerId,
      ...(status && { status: status.toUpperCase() }),
      job: {
        ...(industry && { industry }),
        ...(jobType && { jobType }),
        ...(title && {
          title: {
            contains: title,
            mode: "insensitive", // for case-insensitive search
          },
        }),
      },
    };

    // Fetch total count with filters
    const total = await prisma.jobApplication.count({
      where: filters,
    });

    // Fetch applications
    const applications = await prisma.jobApplication.findMany({
      where: filters,
      skip,
      take,
      orderBy: { appliedAt: "desc" },
      include: {
        job: {
          include: {
            company: {
              select: {
                companyName: true,
                industry: true,
                website: true,
              },
            },
          },
        },
      },
    });

    res.json({
      total,
      page: parseInt(page),
      pageSize: take,
      totalPages: Math.ceil(total / take),
      applications,
      ...(applications.length === 0 && { message: "No applications found" }),
    });
  } catch (error) {
    next(error);
  }
};

exports.getJobsForJobSeeker = async (req, res, next) => {
  try {
    const jobSeekerId = req.user.id;

    // Fetch job seeker data
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { id: jobSeekerId },
    });

    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found" });
    }

    const { skills, interests } = jobSeeker;

    // Build the filter query for matching skills, interests, and job details
    const jobFilters = {
      OR: [
        // Match job skills with job seeker skills (match each skill individually)
        {
          skillsRequired: {
            contains: skills[0], // Check if skillsRequired contains job seeker's first skill
            mode: "insensitive",
          },
        },
        ...(skills.length > 1
          ? skills.slice(1).map((skill) => ({
              skillsRequired: {
                contains: skill, // Check if skillsRequired contains each additional skill
                mode: "insensitive",
              },
            }))
          : []), // If more skills exist, build a separate query for each
        // Match job description with job seeker interests
        {
          description: {
            contains: interests.join(" "), // Match description with job seeker's interests
            mode: "insensitive",
          },
        },
        // Match job title with job seeker interests
        {
          title: {
            contains: interests.join(" "), // Match title with job seeker's interests
            mode: "insensitive",
          },
        },
      ],
    };

    // Fetch matching jobs
    const jobs = await prisma.job.findMany({
      where: jobFilters,
    });

    if (jobs.length === 0) {
      return res
        .status(404)
        .json({ message: "No jobs found matching your interests or skills" });
    }

    return res.json({ jobs });
  } catch (error) {
    next(error);
  }
};

exports.getJobByIdForJobSeeker = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const jobSeekerId = req.user.id; // assuming the logged-in user is a job seeker

    // Check if job seeker exists
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { id: jobSeekerId },
    });

    if (!jobSeeker) {
      return res.status(403).json({
        message:
          "You need to complete your job seeker profile to view this job.",
      });
    }

    // Fetch the job by ID including company info
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: {
            companyName: true,
            industry: true,
            website: true,
            companyLogo: true,
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({ job });
  } catch (error) {
    next(error);
  }
};

// Startup/Company Section //
exports.getAllJobApplicationsForCompany = async (req, res, next) => {
  try {
    const companyId = req.user.id; // assuming JWT gives company ID
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const skip = (page - 1) * pageSize;

    // Get all applications related to this company's jobs (paginated)
    const [applications, totalApplications, jobsWithApplicantCounts] =
      await Promise.all([
        prisma.jobApplication.findMany({
          where: {
            job: {
              companyId: companyId,
            },
          },
          include: {
            job: true,
            jobSeeker: {
              select: {
                id: true,
                fullName: true,
                shortBio: true,
                resumeUrl: true,
                skills: true,
                interests: true,
              },
            },
          },
          orderBy: {
            appliedAt: "desc", // Most recently applied first
          },
          skip,
          take: pageSize,
        }),

        // Total applications across all jobs
        prisma.jobApplication.count({
          where: {
            job: {
              companyId: companyId,
            },
          },
        }),

        // Job-wise applicant count
        prisma.job.findMany({
          where: { companyId },
          select: {
            id: true,
            title: true,
            _count: {
              select: { applications: true },
            },
          },
        }),
      ]);

    const totalPages = Math.ceil(totalApplications / pageSize);

    res.status(200).json({
      totalApplications,
      page,
      pageSize,
      totalPages,
      applications,
      applicantCountPerJob: jobsWithApplicantCounts.map((job) => ({
        jobId: job.id,
        title: job.title,
        applicantCount: job._count.applications,
      })),
      ...(applications.length === 0 && { message: "No applications yet" }),
    });
  } catch (error) {
    next(error);
  }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const companyId = req.user.id; // company ID from JWT

    // Validate status
    const validStatuses = ["PENDING", "ACCEPTED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid application status" });
    }

    // Check that the application exists and belongs to this company's job
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
      },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.job.companyId !== companyId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this application" });
    }

    // Update status
    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
    });

    res.status(200).json({
      message: "Application status updated successfully",
      updatedStatus: updated.status,
    });
  } catch (error) {
    next(error);
  }
};

exports.getJobWithApplicants = async (req, res, next) => {
  try {
    const companyId = req.user.id; // assuming user.id is from the authenticated company
    const { jobId } = req.params;

    // Check if the job belongs to this company
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        companyId: companyId,
      },
      include: {
        applications: {
          include: {
            jobSeeker: true, // include job seeker info for each application
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or does not belong to this company.",
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};
