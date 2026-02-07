const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

exports.getSavedJobs = async (req, res) => {
  try {
    const saved = await SavedJob.find({ user: req.user._id })
      .populate('job')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: saved.map((item) => item.job),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load saved jobs',
    });
  }
};

exports.toggleSavedJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    const existing = await SavedJob.findOne({ user: req.user._id, job: jobId });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({
        success: true,
        saved: false,
      });
    }

    await SavedJob.create({ user: req.user._id, job: jobId });
    return res.status(201).json({
      success: true,
      saved: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update saved jobs',
    });
  }
};

exports.clearSavedJobs = async (req, res) => {
  try {
    await SavedJob.deleteMany({ user: req.user._id });
    res.status(200).json({
      success: true,
      message: 'Saved jobs cleared',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear saved jobs',
    });
  }
};
