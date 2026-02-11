const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { CSRF_COOKIE_NAME } = require('../middleware/csrfMiddleware');

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
const isValidPassword = (password) => {
  return password.length >= 6 && password.length <= 128;
};

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);

const generateAccessToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: ACCESS_TOKEN_TTL,
    algorithm: 'HS256',
  });
};

const generateRefreshToken = () => crypto.randomBytes(40).toString('hex');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const getRefreshCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    // Cross-site refresh cookies need SameSite=None in production.
    sameSite: isProd ? 'none' : 'lax',
    maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  };
};

const getCsrfCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  };
};

const generateCsrfToken = () => crypto.randomBytes(32).toString('hex');

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, getRefreshCookieOptions());
  // Double-submit CSRF token for cookie-based endpoints.
  res.cookie(CSRF_COOKIE_NAME, generateCsrfToken(), getCsrfCookieOptions());
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', getRefreshCookieOptions());
  res.clearCookie(CSRF_COOKIE_NAME, getCsrfCookieOptions());
};

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate all required fields exist
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Sanitize inputs
    const sanitizedName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const sanitizedPassword = String(password);
    // Allow self-registration for jobseeker/employer only; admins must be provisioned server-side.
    const allowedRoles = new Set(['jobseeker', 'employer']);
    let sanitizedRole = 'jobseeker';
    if (role !== undefined) {
      const normalizedRole = String(role).trim().toLowerCase();
      if (!allowedRoles.has(normalizedRole)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Only jobseeker or employer is allowed.',
        });
      }
      sanitizedRole = normalizedRole;
    }

    // Validate name
    if (sanitizedName.length < 2 || sanitizedName.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 50 characters',
      });
    }

    // Validate email format
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Validate password strength
    if (!isValidPassword(sanitizedPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 6 and 128 characters',
      });
    }

    // Check if user already exists (case-insensitive email)
    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create user
    const user = await User.create({
      name: sanitizedName,
      email: normalizedEmail,
      password: sanitizedPassword,
      role: sanitizedRole,
    });

    // Generate access + refresh tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken();

    user.refreshTokenHash = hashToken(refreshToken);
    user.refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    // Return user data (without password)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation failed',
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error registering user. Please try again later.',
    });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Sanitize inputs
    const normalizedEmail = String(email).trim().toLowerCase();
    const sanitizedPassword = String(password);

    // Validate email format
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password').lean();

    if (!user) {
      // Generic error message for security (prevents email enumeration)
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare passwords using bcrypt
    const isMatch = await require('bcryptjs').compare(sanitizedPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate access + refresh tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken();

    const userDoc = await User.findById(user._id);
    userDoc.refreshTokenHash = hashToken(refreshToken);
    userDoc.refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await userDoc.save();

    setRefreshTokenCookie(res, refreshToken);

    // Return user data (without password)
    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token: accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again later.',
    });
  }
};

// Change Password (Authenticated)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required',
      });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be between 6 and 128 characters',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isMatch = await require('bcryptjs').compare(String(currentPassword), user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = String(newPassword);
    user.refreshTokenHash = null;
    user.refreshTokenExpiresAt = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password. Please try again later.',
    });
  }
};

// Refresh Access Token
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token missing',
      });
    }

    const tokenHash = hashToken(token);
    const user = await User.findOne({ refreshTokenHash: tokenHash });

    if (!user || !user.refreshTokenExpiresAt || user.refreshTokenExpiresAt < new Date()) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired or invalid',
      });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken();

    user.refreshTokenHash = hashToken(newRefreshToken);
    user.refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await user.save();

    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      success: true,
      token: newAccessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
    });
  }
};

// Logout User (revoke refresh token)
exports.logoutUser = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const tokenHash = hashToken(token);
      await User.findOneAndUpdate(
        { refreshTokenHash: tokenHash },
        { refreshTokenHash: null, refreshTokenExpiresAt: null }
      );
    }

    clearRefreshTokenCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
    });
  }
};
