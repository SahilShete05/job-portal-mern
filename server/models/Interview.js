const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobApplication',
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 30,
      min: 15,
      max: 240,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    meetingLink: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['scheduled', 'rescheduled', 'completed', 'canceled'],
      default: 'scheduled',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    candidateRequest: {
      type: {
        type: String,
        enum: ['reschedule', 'cancel'],
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
      },
      requestedAt: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      reason: {
        type: String,
        trim: true,
        maxlength: 2000,
      },
    },
  },
  {
    timestamps: true,
  }
);

interviewSchema.index({ employer: 1, scheduledAt: -1 });
interviewSchema.index({ candidate: 1, scheduledAt: -1 });

module.exports = mongoose.model('Interview', interviewSchema);
