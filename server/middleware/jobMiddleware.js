const Job = require('../models/Job');

// Verify job ownership - middleware to check if user is the job creator
const verifyJobOwnership = async (req, res, next) => {
  try {
    const jobId = req.params.jobId || req.params.id;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required',
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check if user is the job creator
    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to perform this action on this job',
      });
    }

    // Attach job to request for use in next middleware/controller
    req.job = job;

    next();
  } catch (error) {
    console.error('Job ownership verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify job ownership',
    });
  }
};

module.exports = {
  verifyJobOwnership,
};
