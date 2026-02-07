const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    fullName: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      match: [/^(\+\d{1,3}[- ]?)?\d{10}$|^$/i, 'Please provide a valid phone number'],
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    about: {
      type: String,
      trim: true,
      default: '',
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: {
      type: String,
      trim: true,
    },
    resume: {
      type: String,
      trim: true,
    },
    resumePublicId: {
      type: String,
      trim: true,
      default: '',
    },
    resumeResourceType: {
      type: String,
      trim: true,
      default: 'raw',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
