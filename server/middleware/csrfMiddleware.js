const { isOriginAllowed } = require('../config/cors');

const CSRF_COOKIE_NAME = 'csrfToken';
const CSRF_HEADER_NAME = 'x-csrf-token';

const getOriginFromHeader = (req) => {
  if (req.headers.origin) {
    return req.headers.origin;
  }

  const referer = req.headers.referer;
  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).origin;
  } catch (error) {
    return null;
  }
};

const csrfProtect = (req, res, next) => {
  const origin = getOriginFromHeader(req);

  // Origin validation is required for cookie-based auth endpoints.
  if (!origin || !isOriginAllowed(origin)) {
    return res.status(403).json({
      success: false,
      message: 'CSRF validation failed',
    });
  }

  const csrfCookie = req.cookies?.[CSRF_COOKIE_NAME];
  const csrfHeader = req.headers[CSRF_HEADER_NAME];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token invalid',
    });
  }

  return next();
};

module.exports = {
  csrfProtect,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
};
