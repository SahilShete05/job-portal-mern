const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const { createNotification } = require('../utils/notificationService');
const { sendEmail } = require('../utils/emailService');
const { streamRemoteFile } = require('../utils/streamFile');

// APPLY FOR JOB (Job Seeker Only)
exports.applyJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // Validate input
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required',
      });
    }

    // Check if job exists and is active
    const job = await Job.findById(jobId).populate('createdBy', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check if job is still active
    if (!job.isActive) {
      return res.status(410).json({
        success: false,
        message: 'This job is no longer accepting applications',
      });
    }

    // Prevent self-application
    if (job.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply to your own job posting',
      });
    }

    // Check if already applied
    const existingApplication = await JobApplication.findOne({
      job: jobId,
      applicant: req.user._id,
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this job',
      });
    }

    // Get applicant's resume from profile
    const profile = await Profile.findOne({ user: req.user._id });
    const resume = profile?.resume || null;

    // Create application
    const application = await JobApplication.create({
      job: jobId,
      applicant: req.user._id,
      resume: resume,
      status: 'applied',
      appliedAt: new Date(),
    });

    // Populate details
    await application.populate([
      { path: 'job', select: 'title companyName location' },
      { path: 'applicant', select: 'name email' },
    ]);

    await createNotification({
      userId: job.createdBy,
      type: 'application',
      title: 'New application received',
      body: `${req.user.name} applied to ${job.title}`,
      link: `/employer/jobs/${job._id}/applicants`,
      meta: { jobId: job._id, applicationId: application._id },
    });

    try {
      const employerEmail = job.createdBy?.email;
      if (employerEmail) {
        await sendEmail({
          to: employerEmail,
          subject: `New application for ${job.title}`,
          text: `${req.user.name} applied to ${job.title}.`,
          html: `<p><strong>${req.user.name}</strong> applied to <strong>${job.title}</strong>.</p>`,
        });
      }
    } catch (emailError) {
      console.warn('Application email failed:', emailError.message || emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: application,
      data: application,
    });
  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message,
    });
  }
};

// GET JOB SEEKER'S APPLICATIONS
exports.getMyApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

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

    // Build filter
    const filter = { applicant: req.user._id };

    if (status) {
      const allowedStatuses = ['applied', 'shortlisted', 'interview', 'offered', 'hired', 'rejected', 'withdrawn', 'closed'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status filter',
        });
      }
      filter.status = status;
    }

    // Get total count
    const total = await JobApplication.countDocuments(filter);

    // Get applications with pagination
    const applications = await JobApplication.find(filter)
      .populate({
        path: 'job',
        select: 'title companyName location jobType salary skills',
        populate: {
          path: 'createdBy',
          select: 'name email',
        },
      })
      .populate('applicant', 'name email')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      message: 'Applications retrieved successfully',
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
      data: applications,
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications',
      error: error.message,
    });
  }
};

// GET APPLICATIONS FOR JOB (Employer Only)
exports.getApplicationsByJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const { page = 1, limit = 10, status } = req.query;

    // Validate job ID
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required',
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Verify ownership - employer must own the job
    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this job',
      });
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

    // Build filter
    const filter = { job: jobId };

    if (status) {
      const allowedStatuses = ['applied', 'shortlisted', 'interview', 'offered', 'hired', 'rejected', 'withdrawn', 'closed'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status filter',
        });
      }
      filter.status = status;
    }

    // Get total count
    const total = await JobApplication.countDocuments(filter);

    // Get applications with pagination
    const applications = await JobApplication.find(filter)
      .populate('applicant', 'name email')
      .populate('job', 'title companyName')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      message: 'Job applications retrieved successfully',
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
      data: applications,
    });
  } catch (error) {
    console.error('Get applications by job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications',
      error: error.message,
    });
  }
};

// UPDATE APPLICATION STATUS (Employer Only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const { status } = req.body;

    // Validate input
    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required',
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    // Normalize and validate status value
    const normalizedStatus = String(status).toLowerCase();
    const statusMap = {
      pending: 'applied',
      accepted: 'shortlisted',
      applied: 'applied',
      shortlisted: 'shortlisted',
      interview: 'interview',
      offered: 'offered',
      hired: 'hired',
      rejected: 'rejected',
      withdrawn: 'withdrawn',
      closed: 'closed',
    };

    if (!statusMap[normalizedStatus]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    // Get application with job details
    let application = await JobApplication.findById(applicationId).populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Verify employer ownership - employer must own the job
    if (application.job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application',
      });
    }

    // Update status
    application = await JobApplication.findByIdAndUpdate(
      applicationId,
      { status: statusMap[normalizedStatus] },
      { new: true, runValidators: true }
    ).populate([
      { path: 'applicant', select: 'name email' },
      { path: 'job', select: 'title companyName' },
    ]);

    await createNotification({
      userId: application.applicant._id,
      type: 'application',
      title: 'Application status updated',
      body: `Your application for ${application.job.title} was marked as ${statusMap[normalizedStatus]}`,
      link: '/applied-jobs',
      meta: { applicationId: application._id },
    });

    try {
      await sendEmail({
        to: application.applicant.email,
        subject: `Application update: ${application.job.title}`,
        text: `Your application for ${application.job.title} has been marked as ${statusMap[normalizedStatus]}.`,
        html: `<p>Your application for <strong>${application.job.title}</strong> has been marked as <strong>${statusMap[normalizedStatus]}</strong>.</p>`,
      });
    } catch (emailError) {
      console.warn('Email notification failed:', emailError.message || emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: application,
      application,
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message,
    });
  }
};

// GET SINGLE APPLICATION (Employer Or Applicant Only)
exports.getApplicationById = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;

    // Validate input
    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required',
      });
    }

    // Get application
    const application = await JobApplication.findById(applicationId).populate([
      {
        path: 'job',
        select: 'title companyName location jobType salary skills',
        populate: { path: 'createdBy', select: 'name email' },
      },
      { path: 'applicant', select: 'name email' },
    ]);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Verify access - applicant or job owner
    const isApplicant = application.applicant._id.toString() === req.user._id.toString();
    const isEmployer = application.job.createdBy._id.toString() === req.user._id.toString();

    if (!isApplicant && !isEmployer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application retrieved successfully',
      data: application,
    });
  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve application',
      error: error.message,
    });
  }
};

// VIEW APPLICATION RESUME (Employer Or Applicant Only)
exports.viewApplicationResume = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required',
      });
    }

    const application = await JobApplication.findById(applicationId).populate([
      {
        path: 'job',
        select: 'title companyName location jobType salary skills',
        populate: { path: 'createdBy', select: 'name email' },
      },
      { path: 'applicant', select: 'name email' },
    ]);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const isApplicant = application.applicant._id.toString() === req.user._id.toString();
    const isEmployer = application.job.createdBy._id.toString() === req.user._id.toString();

    if (!isApplicant && !isEmployer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this resume',
      });
    }

    if (!application.resume) {
      return res.status(404).json({
        success: false,
        message: 'No resume found for this application',
      });
    }

    return streamRemoteFile(application.resume, res);
  } catch (error) {
    console.error('View application resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to view resume',
      error: error.message,
    });
  }
};

// WITHDRAW APPLICATION (Job Seeker Only)
exports.withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await JobApplication.findById(applicationId).populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application',
      });
    }

    if (['hired', 'rejected', 'withdrawn', 'closed'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'This application can no longer be withdrawn',
      });
    }

    application.status = 'withdrawn';
    await application.save();

    await createNotification({
      userId: application.job.createdBy,
      type: 'application',
      title: 'Application withdrawn',
      body: `${req.user.name} withdrew their application for ${application.job.title}`,
      link: `/employer/jobs/${application.job._id}/applicants`,
      meta: { applicationId: application._id, jobId: application.job._id },
    });

    res.status(200).json({
      success: true,
      message: 'Application withdrawn',
      data: application,
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw application',
    });
  }
};

