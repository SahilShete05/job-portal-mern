const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { employerOnly } = require('../middleware/roleMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { interviewSchema, interviewUpdateSchema, interviewCandidateUpdateSchema } = require('../validation/schemas');
const {
  createInterview,
  getInterviews,
  updateInterview,
  cancelInterview,
  updateInterviewByCandidate,
} = require('../controllers/interviewController');

const router = express.Router();

router.get('/', protect, getInterviews);
router.post('/', protect, employerOnly, validateRequest(interviewSchema), createInterview);
router.put('/:id', protect, employerOnly, validateRequest(interviewUpdateSchema), updateInterview);
router.delete('/:id', protect, employerOnly, cancelInterview);
router.patch('/:id', protect, validateRequest(interviewCandidateUpdateSchema), updateInterviewByCandidate);

module.exports = router;
