const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { jobseekerOnly } = require('../middleware/roleMiddleware');
const { getSavedJobs, toggleSavedJob, clearSavedJobs } = require('../controllers/savedJobController');

const router = express.Router();

router.get('/', protect, jobseekerOnly, getSavedJobs);
router.post('/:jobId', protect, jobseekerOnly, toggleSavedJob);
router.delete('/', protect, jobseekerOnly, clearSavedJobs);

module.exports = router;
