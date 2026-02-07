const express = require('express');
const {
  applyJob,
  getMyApplications,
  getApplicationsByJob,
  updateApplicationStatus,
  getApplicationById,
  viewApplicationResume,
  withdrawApplication,
} = require('../controllers/jobApplicationController');
const { protect } = require('../middleware/authMiddleware');
const { jobseekerOnly, employerOnly } = require('../middleware/roleMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { applyJobSchema, applicationStatusSchema, applicationIdParamSchema } = require('../validation/schemas');

const router = express.Router();

// Job Seeker routes
router.post('/:jobId', protect, jobseekerOnly, validateRequest(applyJobSchema), applyJob);
router.get('/me', protect, jobseekerOnly, getMyApplications);
router.patch('/:applicationId/withdraw', protect, jobseekerOnly, validateRequest(applicationIdParamSchema), withdrawApplication);

// Employer routes
router.get('/job/:jobId', protect, employerOnly, getApplicationsByJob);
router.patch('/:applicationId/status', protect, employerOnly, validateRequest(applicationStatusSchema), updateApplicationStatus);

// Get single application (both applicant and employer can access)
router.get('/:applicationId/resume', protect, viewApplicationResume);
router.get('/:applicationId', protect, getApplicationById);

module.exports = router;
