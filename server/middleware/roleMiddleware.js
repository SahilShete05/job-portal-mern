// Role-based access control middleware
const jobseekerOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({
        success: false,
        message: 'This action is only available for job seekers',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Role check failed',
    });
  }
};

const employerOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        message: 'This action is only available for employers',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Role check failed',
    });
  }
};

const adminOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This action is only available for admins',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Role check failed',
    });
  }
};

module.exports = {
  jobseekerOnly,
  employerOnly,
  adminOnly,
};
