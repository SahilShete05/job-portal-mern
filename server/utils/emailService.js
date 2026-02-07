const { Resend } = require('resend');

let resendClient = null;

const getResendClient = () => {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return null;
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const from = process.env.RESEND_FROM || process.env.EMAIL_FROM || 'Resend <onboarding@resend.dev>';
  const client = getResendClient();

  console.info('[email] send attempt', {
    to,
    subject,
  });

  if (!client || !from) {
    console.warn('[email] service not configured. Set RESEND_API_KEY and RESEND_FROM.');
    return { skipped: true, reason: 'not_configured' };
  }

  try {
    const result = await client.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    console.info('[email] send success', {
      to,
      subject,
      id: result?.id,
    });

    return result;
  } catch (error) {
    console.error('[email] send failed', {
      to,
      subject,
      error: error?.message || error,
    });
    return { error: error?.message || 'unknown_error' };
  }
};

module.exports = { sendEmail };
