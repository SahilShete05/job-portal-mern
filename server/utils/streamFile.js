const http = require('http');
const https = require('https');
const path = require('path');
const { URL } = require('url');

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

const streamRemoteFile = (fileUrl, res) => {
  const parsedUrl = new URL(fileUrl);
  const client = parsedUrl.protocol === 'https:' ? https : http;
  const fallbackName = path.basename(parsedUrl.pathname) || 'resume';

  client
    .get(fileUrl, (fileRes) => {
      if (fileRes.statusCode && fileRes.statusCode >= 400) {
        res.status(fileRes.statusCode).json({
          success: false,
          message: 'Failed to fetch resume file',
        });
        fileRes.resume();
        return;
      }

      const contentType = getContentType(parsedUrl.pathname, fileRes.headers['content-type']);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${fallbackName}"`);

      fileRes.pipe(res);
    })
    .on('error', (error) => {
      console.error('Resume stream error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to stream resume file',
      });
    });
};

module.exports = { streamRemoteFile };
