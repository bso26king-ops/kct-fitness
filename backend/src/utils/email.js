const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} token - Password reset token
 * @returns {Promise<object>} - Nodemailer response
 */
async function sendPasswordResetEmail(email, token) {
  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  return transporter.sendMail({
    from: `"KCT Fitness" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password (valid for 1 hour):</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
}

/**
 * Send welcome email
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<object>} - Nodemailer response
 */
async function sendWelcomeEmail(email, name) {
  return transporter.sendMail({
    from: `"KCT Fitness" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Welcome to KCT Fitness!',
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>We're excited to have you on board. Get started with your fitness journey today!</p>
      <p>Your trial period lasts 14 days. Upgrade anytime to unlock premium features.</p>
      <a href="${process.env.CLIENT_URL}">Go to App</a>
    `,
  });
}

/**
 * Send trial expiration warning email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {number} daysRemaining - Days remaining on trial
 * @returns {Promise<object>} - Nodemailer response
 */
async function sendTrialWarningEmail(email, name, daysRemaining) {
  return transporter.sendMail({
    from: `"KCT Fitness" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Your trial ends in ${daysRemaining} day(s)`,
    html: `
      <h2>Don't lose access, ${name}!</h2>
      <p>Your free trial expires in ${daysRemaining} day(s).</p>
      <p>Upgrade now to continue your fitness journey with premium features.</p>
      <a href="${process.env.CLIENT_URL}/pricing">Upgrade to Premium</a>
    `,
  });
}

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendTrialWarningEmail,
};
