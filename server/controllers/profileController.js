const Profile = require('../models/Profile');
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary');
const { streamRemoteFile } = require('../utils/streamFile');

// GET logged-in job seeker profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find profile by user ID
    let profile = await Profile.findOne({ user: userId }).populate('user', 'name email role');

    if (!profile) {
      // Create empty profile if it doesn't exist
      profile = new Profile({
        user: userId,
        fullName: '',
        phone: '',
        location: '',
        about: '',
        skills: [],
        experience: '',
        resume: null,
      });
      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profile,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: error.message,
    });
  }
};

// UPDATE job seeker profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, phone, location, about, skills, experience } = req.body;

    // Validate inputs
    const errors = [];

    // Validate full name
    if (fullName !== undefined) {
      const trimmedName = String(fullName).trim();
      if (trimmedName.length < 2) {
        errors.push('Full name must be at least 2 characters long');
      }
      if (trimmedName.length > 100) {
        errors.push('Full name must not exceed 100 characters');
      }
    }

    // Validate phone number format
    if (phone !== undefined) {
      const trimmedPhone = String(phone).trim();
      const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
      if (trimmedPhone && !phoneRegex.test(trimmedPhone)) {
        errors.push('Please provide a valid phone number');
      }
    }

    // Validate skills
    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        errors.push('Skills must be an array');
      } else if (skills.length > 30) {
        errors.push('Maximum 30 skills allowed');
      } else {
        const invalidSkills = skills.some(skill => {
          const trimmed = String(skill).trim();
          return trimmed.length === 0 || trimmed.length > 50;
        });
        if (invalidSkills) {
          errors.push('Each skill must be 1-50 characters');
        }
      }
    }

    // Validate experience
    if (experience !== undefined) {
      const trimmedExp = String(experience).trim();
      if (trimmedExp.length > 2000) {
        errors.push('Experience must not exceed 2000 characters');
      }
    }

    if (location !== undefined) {
      const trimmedLocation = String(location).trim();
      if (trimmedLocation.length > 120) {
        errors.push('Location must not exceed 120 characters');
      }
    }

    if (about !== undefined) {
      const trimmedAbout = String(about).trim();
      if (trimmedAbout.length > 2000) {
        errors.push('About section must not exceed 2000 characters');
      }
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors,
      });
    }

    // Build update object with sanitized data
    const updateData = {};

    if (fullName !== undefined) {
      updateData.fullName = String(fullName).trim();
    }

    if (phone !== undefined) {
      updateData.phone = String(phone).trim();
    }

    if (location !== undefined) {
      updateData.location = String(location).trim();
    }

    if (about !== undefined) {
      updateData.about = String(about).trim();
    }

    if (skills !== undefined) {
      updateData.skills = skills
        .map(skill => String(skill).trim())
        .filter(skill => skill.length > 0);
    }

    if (experience !== undefined) {
      updateData.experience = String(experience).trim();
    }

    // Find and update profile
    let profile = await Profile.findOne({ user: userId });

    if (!profile) {
      // Create new profile if doesn't exist
      profile = new Profile({
        user: userId,
        ...updateData,
      });
    } else {
      // Update existing profile
      Object.assign(profile, updateData);
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

// UPLOAD resume
exports.uploadResume = async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Resume storage is not configured',
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please provide a resume file.',
      });
    }

    const userId = req.user._id;

    // Additional validation for file size and type (backup)
    const maxFileSize = 2 * 1024 * 1024; // 2MB
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (req.file.size > maxFileSize) {
      return res.status(413).json({
        success: false,
        message: 'File size exceeds 2MB limit',
      });
    }

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.',
      });
    }

    // Find profile
    let profile = await Profile.findOne({ user: userId });

    if (!profile) {
      // Create new profile if doesn't exist
      profile = new Profile({
        user: userId,
      });
    } else if (profile.resumePublicId) {
      try {
        const deleteOptions = profile.resumeResourceType
          ? { resource_type: profile.resumeResourceType }
          : undefined;
        await cloudinary.uploader.destroy(profile.resumePublicId, deleteOptions);
      } catch (deleteError) {
        console.warn('Failed to delete old resume file:', deleteError);
      }
    }

    const isPdf = req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf');
    const resourceType = isPdf ? 'image' : 'raw';

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_RESUME_FOLDER || 'job-portal/resumes',
          resource_type: resourceType,
          filename_override: req.file.originalname,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    profile.resume = uploadResult.secure_url;
    profile.resumePublicId = uploadResult.public_id;
    profile.resumeResourceType = resourceType;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resumeFileName: req.file.originalname,
        resume: profile.resume,
        uploadedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Upload resume error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to upload resume',
      error: error.message,
    });
  }
};

// DELETE resume
exports.deleteResume = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find profile
    const profile = await Profile.findOne({ user: userId });

    if (!profile || !profile.resume) {
      return res.status(404).json({
        success: false,
        message: 'No resume found to delete',
      });
    }

    if (profile.resumePublicId) {
      const deleteOptions = profile.resumeResourceType
        ? { resource_type: profile.resumeResourceType }
        : undefined;
      await cloudinary.uploader.destroy(profile.resumePublicId, deleteOptions);
    }

    // Clear resume from profile
    profile.resume = null;
    profile.resumePublicId = null;
    profile.resumeResourceType = 'raw';

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume',
      error: error.message,
    });
  }
};

// GET logged-in employer profile
exports.getEmployerProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      'name email role companyName contactEmail companyWebsite industry companySize location description logo'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employer profile retrieved successfully',
      data: user,
    });
  } catch (error) {
    console.error('Get employer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employer profile',
      error: error.message,
    });
  }
};

// UPDATE logged-in employer profile
exports.updateEmployerProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { companyName, contactEmail, companyWebsite, industry, companySize, location, description, logo } = req.body;

    const errors = [];

    if (companyName !== undefined) {
      const trimmedName = String(companyName).trim();
      if (trimmedName.length < 2) {
        errors.push('Company name must be at least 2 characters long');
      }
      if (trimmedName.length > 200) {
        errors.push('Company name must not exceed 200 characters');
      }
    }

    if (contactEmail !== undefined) {
      const trimmedEmail = String(contactEmail).trim().toLowerCase();
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (trimmedEmail && !emailRegex.test(trimmedEmail)) {
        errors.push('Please provide a valid contact email');
      }
    }

    if (companyWebsite !== undefined) {
      const trimmedWebsite = String(companyWebsite).trim();
      if (trimmedWebsite.length > 200) {
        errors.push('Company website must not exceed 200 characters');
      }
    }

    if (industry !== undefined) {
      const trimmedIndustry = String(industry).trim();
      if (trimmedIndustry.length > 120) {
        errors.push('Industry must not exceed 120 characters');
      }
    }

    if (companySize !== undefined) {
      const trimmedSize = String(companySize).trim();
      if (trimmedSize.length > 50) {
        errors.push('Company size must not exceed 50 characters');
      }
    }

    if (location !== undefined) {
      const trimmedLocation = String(location).trim();
      if (trimmedLocation.length > 120) {
        errors.push('Location must not exceed 120 characters');
      }
    }

    if (description !== undefined) {
      const trimmedDescription = String(description).trim();
      if (trimmedDescription.length > 2000) {
        errors.push('Description must not exceed 2000 characters');
      }
    }

    if (logo !== undefined) {
      const trimmedLogo = String(logo).trim();
      if (trimmedLogo.length > 500) {
        errors.push('Logo URL must not exceed 500 characters');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const updateData = {};

    if (companyName !== undefined) {
      updateData.companyName = String(companyName).trim();
    }

    if (contactEmail !== undefined) {
      updateData.contactEmail = String(contactEmail).trim().toLowerCase();
    }

    if (companyWebsite !== undefined) {
      updateData.companyWebsite = String(companyWebsite).trim();
    }

    if (industry !== undefined) {
      updateData.industry = String(industry).trim();
    }

    if (companySize !== undefined) {
      updateData.companySize = String(companySize).trim();
    }

    if (location !== undefined) {
      updateData.location = String(location).trim();
    }

    if (description !== undefined) {
      updateData.description = String(description).trim();
    }

    if (logo !== undefined) {
      updateData.logo = String(logo).trim();
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
      select: 'name email role companyName contactEmail companyWebsite industry companySize location description logo',
    });

    res.status(200).json({
      success: true,
      message: 'Employer profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update employer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employer profile',
      error: error.message,
    });
  }
};

// VIEW resume (Job Seeker Only)
exports.viewResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ user: userId });

    if (!profile || !profile.resume) {
      return res.status(404).json({
        success: false,
        message: 'No resume found to view',
      });
    }

    return streamRemoteFile(profile.resume, res);
  } catch (error) {
    console.error('View resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to view resume',
      error: error.message,
    });
  }
};
