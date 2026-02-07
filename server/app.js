const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { isOriginAllowed } = require('./config/cors');
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const jobApplicationRoutes = require("./routes/jobApplicationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const profileRoutes = require("./routes/profileRoutes");
const messagingRoutes = require("./routes/messagingRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const savedJobRoutes = require("./routes/savedJobRoutes");
let devRoutes = null;
if (process.env.NODE_ENV !== 'production') {
  devRoutes = require('./routes/devRoutes');
}

const app = express();

// Render runs behind a proxy; trust it for secure cookies and rate limits.
app.set('trust proxy', 1);
app.disable('x-powered-by');

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
};

app.use(cors(corsOptions));
app.use(cookieParser());

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'none'"],
        "frame-ancestors": ["'none'"],
        "base-uri": ["'none'"],
        "form-action": ["'none'"],
      },
    },
    hsts:
      process.env.NODE_ENV === 'production'
        ? { maxAge: 15552000, includeSubDomains: true, preload: true }
        : false,
    crossOriginEmbedderPolicy: false,
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

// Limit request body size to prevent DoS attacks
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ limit: '50kb', extended: true }));

// Request logging middleware (optional)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Job Portal API Server Running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      jobs: "/api/jobs",
      applications: "/api/applications",
      dashboard: "/api/dashboard",
      profile: "/api/profile",
      messages: "/api/messages",
      interviews: "/api/interviews",
      notifications: "/api/notifications"
    }
  });
});

// Auth routes
app.use("/api/auth", authLimiter, authRoutes);

// Apply write limiter to non-auth write routes
app.use('/api', (req, res, next) => {
  const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (writeMethods.includes(req.method)) {
    return writeLimiter(req, res, next);
  }
  return next();
});

// Job routes
app.use("/api/jobs", jobRoutes);

// Job Application routes
app.use("/api/applications", jobApplicationRoutes);

// Dashboard routes
app.use("/api/dashboard", dashboardRoutes);

// Profile routes
app.use("/api/profile", profileRoutes);

// Messaging routes
app.use("/api/messages", messagingRoutes);

// Interview routes
app.use("/api/interviews", interviewRoutes);

// Notification routes
app.use("/api/notifications", notificationRoutes);

// Saved jobs routes
app.use("/api/saved-jobs", savedJobRoutes);

// Dev-only routes
if (devRoutes) {
  app.use('/api/dev', devRoutes);
}

// 404 Handler - must be after all other routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// Global Error Handler Middleware - must be last
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred';
  
  console.error('Error:', {
    status,
    message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
  
  res.status(status).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { 
      error: err.name,
      stack: err.stack 
    }),
  });
});

module.exports = app;
