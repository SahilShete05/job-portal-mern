const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { sendEmail } = require('../utils/emailService');

const router = express.Router();

router.post('/test-email', protect, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  }

  const { to, subject, text, html } = req.body || {};
  const recipient = to || req.user?.email;

  if (!recipient) {
    return res.status(400).json({
      success: false,
      message: 'Recipient email is required',
    });
  }

  const finalSubject = subject || 'Resend test email';
  const finalText = text || 'This is a test email sent from the dev endpoint.';
  const finalHtml = html || `<p>${finalText}</p>`;

  const result = await sendEmail({
    to: recipient,
    subject: finalSubject,
    text: finalText,
    html: finalHtml,
  });

  if (result?.error) {
    return res.status(502).json({
      success: false,
      message: 'Email provider error',
      error: result.error,
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Test email sent (or skipped)',
    data: result || null,
  });
});

module.exports = router;
