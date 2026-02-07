const getCorsOrigins = () => {
  const raw = process.env.CORS_ORIGIN;
  if (raw) {
    return raw
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  if (process.env.NODE_ENV === 'production') {
    return [];
  }

  return ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];
};

const isOriginAllowed = (origin) => {
  if (!origin) {
    return true;
  }

  const allowed = getCorsOrigins();
  if (allowed.length === 0) {
    return false;
  }

  return allowed.includes(origin);
};

module.exports = { getCorsOrigins, isOriginAllowed };
