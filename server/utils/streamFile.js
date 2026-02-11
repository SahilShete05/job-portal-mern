const https = require('https');
const path = require('path');
const net = require('net');
const dns = require('dns').promises;
const { URL } = require('url');

const ALLOWED_HOST_SUFFIXES = ['res.cloudinary.com', 'cloudinary.com'];
const REQUEST_TIMEOUT_MS = 8000;

const isPrivateIp = (ip) => {
  if (!ip) return true;
  if (ip === '127.0.0.1' || ip === '::1' || ip === '::') return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('169.254.')) return true;
  if (ip.startsWith('172.')) {
    const secondOctet = Number(ip.split('.')[1]);
    if (secondOctet >= 16 && secondOctet <= 31) return true;
  }
  if (ip.startsWith('100.')) {
    const secondOctet = Number(ip.split('.')[1]);
    if (secondOctet >= 64 && secondOctet <= 127) return true;
  }
  if (ip.startsWith('192.0.0.') || ip.startsWith('192.0.2.') || ip.startsWith('198.18.') || ip.startsWith('198.19.') || ip.startsWith('198.51.100.') || ip.startsWith('203.0.113.')) {
    return true;
  }
  if (ip.includes(':')) {
    const normalized = ip.toLowerCase();
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    if (normalized.startsWith('fe80:')) return true;
    if (normalized.startsWith('::ffff:')) {
      const mapped = normalized.replace('::ffff:', '');
      return isPrivateIp(mapped);
    }
    if (normalized.startsWith('2001:db8:')) return true;
  }
  return false;
};

const ensureSafeUrl = async (fileUrl) => {
  let parsedUrl;
  try {
    parsedUrl = new URL(fileUrl);
  } catch (error) {
    const err = new Error('Invalid resume URL');
    err.status = 400;
    throw err;
  }

  if (parsedUrl.protocol !== 'https:') {
    const err = new Error('Resume URL must use HTTPS');
    err.status = 400;
    throw err;
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const isAllowedHost = ALLOWED_HOST_SUFFIXES.some(
    (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`)
  );

  if (!isAllowedHost) {
    const err = new Error('Resume host is not allowed');
    err.status = 403;
    throw err;
  }

  if (hostname === 'localhost') {
    const err = new Error('Resume host is not allowed');
    err.status = 403;
    throw err;
  }

  const ipLiteral = net.isIP(hostname);
  const resolvedAddresses = ipLiteral ? [{ address: hostname }] : await dns.lookup(hostname, { all: true });

  if (resolvedAddresses.some((entry) => isPrivateIp(entry.address))) {
    const err = new Error('Resume host resolves to a private network');
    err.status = 403;
    throw err;
  }

  return parsedUrl;
};

const getContentType = (filePath, headerContentType) => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.pdf':
      return 'application/pdf';
    case '.doc':
      return 'application/msword';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default:
      return headerContentType || 'application/octet-stream';
  }
};

const streamRemoteFile = async (fileUrl, res) => {
  const parsedUrl = await ensureSafeUrl(fileUrl);
  const fallbackName = path.basename(parsedUrl.pathname) || 'resume';

  return new Promise((resolve, reject) => {
    const request = https.get(
      fileUrl,
      { timeout: REQUEST_TIMEOUT_MS },
      (fileRes) => {
        if (fileRes.statusCode && fileRes.statusCode >= 400) {
          if (!res.headersSent) {
            res.status(fileRes.statusCode).json({
              success: false,
              message: 'Failed to fetch resume file',
            });
          }
          fileRes.resume();
          resolve();
          return;
        }

        const contentType = getContentType(parsedUrl.pathname, fileRes.headers['content-type']);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${fallbackName}"`);

        fileRes.pipe(res);
        fileRes.on('end', resolve);
        fileRes.on('error', reject);
      }
    );

    request.on('timeout', () => {
      request.destroy(new Error('Resume stream timeout'));
    });

    request.on('error', (error) => {
      console.error('Resume stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to stream resume file',
        });
      }
      reject(error);
    });
  });
};

module.exports = { streamRemoteFile };
