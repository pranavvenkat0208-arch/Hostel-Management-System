const nodemailer = require('nodemailer');
const { env } = require('../config/env');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

// Fire-and-log: a failed email should never break the request that
// triggered it (e.g. registering shouldn't 500 just because Gmail hiccuped),
// so failures are caught and logged here rather than thrown.
async function sendEmail({ to, subject, html }) {
  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    console.warn(`[email] Not configured — skipped "${subject}" to ${to}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM || env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`[email] Sent "${subject}" to ${to}`);
  } catch (error) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, error);
  }
}

module.exports = { sendEmail };
