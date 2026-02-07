const express = require('express');
const {
  getJobSeekerDashboard,
  getEmployerDashboard,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { jobseekerOnly, employerOnly } = require('../middleware/roleMiddleware');

const router = express.Router();

// Job seeker dashboard
router.get('/jobseeker', protect, jobseekerOnly, getJobSeekerDashboard);

// Employer dashboard
router.get('/employer', protect, employerOnly, getEmployerDashboard);

module.exports = router;
