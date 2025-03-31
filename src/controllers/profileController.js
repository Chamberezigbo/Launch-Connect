const { PrismaClient } = require("@prisma/client");
const cloudinary = require("../config/cloudinary");

const prisma = new PrismaClient();

// Function to create a profile
exports.setupProfile = async (req, res, next) => {
  try {
    const {
      role,
      roleInCompany,
      fullName,
      shortBio,
      skills,
      interests,
      companyName,
      industry,
      website,
    } = req.body;
    const userId = req.user.id; // Extracted from the JWT token

    // Validate role
    if (!["job_seeker", "company"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check if the user already has a profile
    const existingProfile = await prisma[
      role === "job_seeker" ? "jobSeeker" : "company"
    ].findUnique({
      where: { id: userId },
    });

    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    let resumeUrl = null;
    let profile;

    // Upload resume to Cloudinary if the user is a job seeker
    if (req.file && role === "job_seeker") {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { resource_type: "auto", folder: "resumes" },
              (error, result) => (error ? reject(error) : resolve(result))
            )
            .end(req.file.buffer);
        });

        resumeUrl = uploadResult.secure_url;
      } catch (uploadError) {
        return res.status(500).json({
          message: "Resume upload failed",
          error: uploadError.message,
        });
      }
    }

    // Create the profile based on role
    if (role === "job_seeker") {
      profile = await prisma.jobSeeker.create({
        data: {
          fullName,
          shortBio,
          user: { connect: { id: userId } },
          resumeUrl,
          skills: Array.isArray(skills)
            ? skills
            : skills.split(",").map((s) => s.trim()),
          interests: Array.isArray(interests)
            ? interests
            : interests.split(",").map((i) => i.trim()),
        },
      });
    } else if (role === "company") {
      profile = await prisma.company.create({
        data: {
          user: { connect: { id: userId } },
          companyName,
          industry,
          website,
          roleInCompany,
          fullName,
        },
      });
    }

    res.status(201).json({ message: "Profile created successfully", profile });
  } catch (error) {
    next(error);
  }
};
