const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
    },
    location: {
      type: String,
      required: [true, 'Please provide a location'],
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'remote'],
      default: 'full-time',
    },
    salary: {
      type: String,
      trim: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    companyName: {
      type: String,
      required: [true, 'Please provide company name'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Job creator is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
