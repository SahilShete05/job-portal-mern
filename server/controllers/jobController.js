const Job = require('../models/Job');
const mongoose = require('mongoose');

// Helper: Validate job data
const validateJobData = (data) => {
  const errors = [];

  if (data.title && data.title.trim().length < 3) {
    errors.push('Job title must be at least 3 characters long');
  }

  if (data.title && data.title.trim().length > 200) {
    errors.push('Job title must not exceed 200 characters');
  }

  if (data.description && data.description.trim().length < 10) {
    errors.push('Job description must be at least 10 characters long');
  }

  if (data.description && data.description.trim().length > 5000) {
    errors.push('Job description must not exceed 5000 characters');
  }

  if (data.location && data.location.trim().length < 2) {
    errors.push('Location must be at least 2 characters long');
  }

  if (data.jobType && !['full-time', 'part-time', 'internship', 'remote'].includes(data.jobType)) {
    errors.push('Invalid job type');
  }

  if (data.skills && Array.isArray(data.skills)) {
    if (data.skills.length > 20) {
      errors.push('Cannot add more than 20 skills');
    }
  }

  return errors;
};

// CREATE JOB (Employer Only)
exports.createJob = async (req, res) => {
  try {
    const { title, description, location, jobType, salary, skills, companyName } = req.body;

    // Validate required fields
    if (!title || !description || !location || !companyName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, location, and company name',
      });
    }

    // Sanitize inputs
    const jobData = {
      title: String(title).trim(),
      description: String(description).trim(),
      location: String(location).trim(),
      companyName: String(companyName).trim(),
      createdBy: req.user._id,
    };

    // Add optional fields if provided
    if (jobType) {
      jobData.jobType = String(jobType).toLowerCase();
    }

    if (salary) {
      jobData.salary = String(salary).trim();
    }

    if (skills && Array.isArray(skills)) {
      jobData.skills = skills
        .map(skill => String(skill).trim())
        .filter(skill => skill.length > 0)
        .slice(0, 20);
    }

    // Validate job data
    const validationErrors = validateJobData(jobData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    // Create job
    const job = await Job.create(jobData);

    // Populate employer details
    await job.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job,
    });
  } catch (error) {
    console.error('Create job error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create job. Please try again later.',
    });
  }
};

// GET ALL JOBS (Public - with search, filter, pagination)
exports.getJobs = async (req, res) => {
  try {
    const { title, location, jobType, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (jobType) {
      filter.jobType = jobType;
    }

    // Calculate pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Validate pagination parameters
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters',
      });
    }

    // Get total count for pagination
    const total = await Job.countDocuments(filter);

    // Get jobs with pagination
    const jobs = await Job.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      message: 'Jobs retrieved successfully',
      count: total,
      jobs: jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
      data: jobs,
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs',
      error: error.message,
    });
  }
};

// GET EMPLOYER'S JOBS
exports.getEmployerJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Calculate pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Validate pagination parameters
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters',
      });
    }

    const filter = { createdBy: req.user._id };

    // Get total count
    const total = await Job.countDocuments(filter);

    // Get employer's jobs
    const jobs = await Job.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      message: 'Employer jobs retrieved successfully',
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
      data: jobs,
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employer jobs',
      error: error.message,
    });
  }
};

// GET SINGLE JOB (Public)
exports.getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID',
      });
    }

    const job = await Job.findById(jobId).populate('createdBy', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job retrieved successfully',
      job: job,
      data: job,
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve job',
      error: error.message,
    });
  }
};

// UPDATE JOB (Employer Only - Owner Verification via Middleware)
exports.updateJob = async (req, res) => {
  try {
    const { title, description, location, jobType, salary, skills, companyName, isActive } =
      req.body;

    // Build update object
    const updateData = {};

    if (title) {
      if (title.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Job title must be at least 3 characters long',
        });
      }
      updateData.title = title.trim();
    }

    if (description) {
      if (description.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Job description must be at least 10 characters long',
        });
      }
      updateData.description = description.trim();
    }

    if (location) {
      updateData.location = location.trim();
    }

    if (jobType) {
      updateData.jobType = jobType;
    }

    if (salary) {
      updateData.salary = salary.trim();
    }

    if (skills && Array.isArray(skills)) {
      updateData.skills = skills.map((skill) => skill.trim()).filter((skill) => skill);
    }

    if (companyName) {
      updateData.companyName = companyName.trim();
    }

    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    // Get job ID from params
    const jobId = req.params.jobId || req.params.id;

    // Find job
    let job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Verify ownership
    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job',
      });
    }

    // Update job
    job = await Job.findByIdAndUpdate(jobId, updateData, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job,
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job',
      error: error.message,
    });
  }
};

// DELETE JOB (Employer Only - Owner Verification via Middleware)
exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.jobId || req.params.id;

    // Find job
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Verify ownership
    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job',
      });
    }

    // Delete job
    await Job.findByIdAndDelete(jobId);

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: error.message,
    });
  }
};

