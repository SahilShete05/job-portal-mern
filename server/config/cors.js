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

  const devOrigins = process.env.CORS_ORIGIN_DEV || '';
  if (!devOrigins) {
    return [];
  }

  return devOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
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
