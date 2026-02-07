const express = require('express');
const { registerUser, loginUser, changePassword, refreshToken, logoutUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { registerSchema, loginSchema, changePasswordSchema } = require('../validation/schemas');
const { csrfProtect } = require('../middleware/csrfMiddleware');

const router = express.Router();

// Register route
router.post('/register', validateRequest(registerSchema), registerUser);

// Login route
router.post('/login', validateRequest(loginSchema), loginUser);

// Change password (authenticated)
router.patch('/change-password', protect, validateRequest(changePasswordSchema), changePassword);

// Refresh access token (cookie-based)
router.post('/refresh', csrfProtect, refreshToken);

// Logout (revoke refresh token)
router.post('/logout', csrfProtect, logoutUser);

module.exports = router;
