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
    if (!["job_seeker", "startupFounder"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check if the user already has a profile
    const existingProfile = await prisma[
      role === "job_seeker" ? "jobSeeker" : "startupFounder"
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
    } else if (role === "startupFounder") {
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

exports.upupdateJobSeekerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; //from jwt middleware
    const { fullName, shortBio, skills, interests } = req.body;

    // Prepare update object dynamically
    const updateData = {};

    if (fullName !== undefined) updateData.fullName = fullName;
    if (shortBio !== undefined) updateData.shortBio = shortBio;
    if (skills !== undefined) updateData.skills = skills.map((s) => s.trim());
    if (interests !== undefined)
      updateData.interests = interests.map((i) => i.trim());

    // Optional: Handle resume upload via Cloudinary
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { resource_type: "auto", folder: "resumes" },
            (error, result) => (error ? reject(error) : resolve(result))
          )
          .end(req.file.buffer);

        updateData.resumeUrl = uploadResult.secure_url;
      });
    }

    // Update profile
    const updatedProfile = await prisma.jobSeeker.update({
      where: { id: userId },
      data: updateData,
    });
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.editCompanyProfile = async (req, res, next) => {
  try {
    const { fullName, companyName, industry, website, roleInCompany } =
      req.body;
    const userId = req.user.id;

    // Initialize updatedData
    const updatedData = {
      fullName,
      companyName,
      industry,
      website,
      roleInCompany,
    };

    Object.keys(updatedData).forEach(
      (key) => updatedData[key] === undefined && delete updatedData[key]
    );

    // If logo file is uploaded
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "company_logos", resource_type: "image" },
            (error, result) => (error ? reject(error) : resolve(result))
          )
          .end(req.file.buffer);
      });

      updatedData.companyLogo = uploadResult.secure_url;
    }

    const updatedCompany = await prisma.company.update({
      where: { id: userId },
      data: updatedData,
    });

    res.status(200).json({
      success: true,
      message: "Company profile updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    next(error);
  }
};
