const nodemailer = require('nodemailer');
const { env } = require('../config/env');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

// Errors are logged, not thrown, so a mail problem never fails a request.
async function sendEmail({ to, subject, html }) {
  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    console.warn(`[email] Not configured, skipped "${subject}" to ${to}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM || env.EMAIL_USER,
      to,
      subject,
      html: String(html),
    });
    console.log(`[email] Sent "${subject}" to ${to}`);
  } catch (error) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, error);
  }
}

module.exports = { sendEmail };
