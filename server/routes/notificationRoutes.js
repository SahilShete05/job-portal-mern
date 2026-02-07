const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  markNotificationRead,
  markAllRead,
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/', protect, getNotifications);
router.patch('/:id/read', protect, markNotificationRead);
router.post('/read-all', protect, markAllRead);

module.exports = router;
