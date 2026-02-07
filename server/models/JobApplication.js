const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job is required'],
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant is required'],
    },
    resume: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'interview', 'offered', 'hired', 'rejected', 'withdrawn', 'closed'],
      default: 'applied',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index to ensure one application per user per job
jobApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
