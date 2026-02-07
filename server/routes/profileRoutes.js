const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { jobseekerOnly, employerOnly } = require('../middleware/roleMiddleware');
const { uploadResume, handleUploadError } = require('../middleware/uploadMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { profileUpdateSchema, employerProfileUpdateSchema } = require('../validation/schemas');
const {
  getProfile,
  updateProfile,
  getEmployerProfile,
  updateEmployerProfile,
  uploadResume: uploadResumeController,
  deleteResume,
  viewResume,
} = require('../controllers/profileController');

// Get logged-in user's profile
router.get('/me', protect, jobseekerOnly, getProfile);

// Update logged-in user's profile
router.put('/me', protect, jobseekerOnly, validateRequest(profileUpdateSchema), updateProfile);

// Upload resume
router.post(
  '/upload-resume',
  protect,
  jobseekerOnly,
  uploadResume,
  handleUploadError,
  uploadResumeController
);

// Delete resume
router.delete('/delete-resume', protect, jobseekerOnly, deleteResume);

// View resume
router.get('/resume/view', protect, jobseekerOnly, viewResume);

// Get logged-in employer profile
router.get('/employer', protect, employerOnly, getEmployerProfile);

// Update logged-in employer profile
router.put('/employer', protect, employerOnly, validateRequest(employerProfileUpdateSchema), updateEmployerProfile);

module.exports = router;
