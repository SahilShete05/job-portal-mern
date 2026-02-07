const express = require('express');
const {
  createJob,
  getJobs,
  getJobById,
  getEmployerJobs,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { employerOnly } = require('../middleware/roleMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { jobSchema, updateJobSchema } = require('../validation/schemas');

const router = express.Router();

// Public routes
router.get('/', getJobs);

// Get employer's own jobs
router.get('/employer/me', protect, employerOnly, getEmployerJobs);

// Job detail
router.get('/:id', getJobById);

// Protected routes - employer only
router.post('/', protect, employerOnly, validateRequest(jobSchema), createJob);

// Update and delete job
router.put('/:jobId', protect, employerOnly, validateRequest(updateJobSchema), updateJob);
router.delete('/:jobId', protect, employerOnly, deleteJob);

module.exports = router;
