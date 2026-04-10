const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendPasswordResetEmail(email, token) {
  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  return transporter.sendMail({ from: `"KCT Fitness" <${process.env.SMTP_USER}>`, to: email, subject: 'Reset Your Password', html: `<h2>Password Reset</h2><a href="${resetLink}">${resetLink}</a>` });
}

async function sendWelcomeEmail(email, name) {
  return transporter.sendMail({ from: `"KCT Fitness" <${process.env.SMTP_USER}>`, to: email, subject: 'Welcome to KCT Fitness!', html: `<h2>Welcome, ${name}!</h2>` });
}

amodule.exports = { sendPasswordResetEmail, sendWelcomeEmail };
