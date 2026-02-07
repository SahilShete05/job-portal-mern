const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { messageSchema } = require('../validation/schemas');
const {
  getConversations,
  getMessages,
  sendMessage,
} = require('../controllers/messagingController');

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/conversations/:conversationId', protect, getMessages);
router.post('/', protect, validateRequest(messageSchema), sendMessage);

module.exports = router;
