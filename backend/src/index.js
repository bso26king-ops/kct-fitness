require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const workoutRoutes = require('./routes/workout.routes');
const exerciseRoutes = require('./routes/exercise.routes');
const progressRoutes = require('./routes/progress.routes');
const groupRoutes = require('./routes/group.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const challengeRoutes = require('./routes/challenge.routes');
const sessionRoutes = require('./routes/session.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
  credentials: true,
}));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Body parsing - raw for Stripe webhooks
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/leaderboards', leaderboardRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

// Privacy policy & account deletion pages (required for Google Play)
const PRIVACY_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>KCT Fitness Privacy Policy</title><style>body{font-family:sans-serif;max-width:800px;margin:0 auto;padding:2rem}</style></head><body><h1>KCT Fitness Privacy Policy</h1><p><strong>Last updated:</strong> April 2026</p><p>KCT Fitness collects your name, email address, and fitness data you enter (workouts, nutrition logs, goals). We do not sell or share your data with third parties. All data is transmitted over HTTPS.</p><h2>Account Deletion</h2><p>You can delete your account in the app (More tab &rarr; Delete Account) or by emailing <a href="mailto:bso26king@gmail.com">bso26king@gmail.com</a>. Deletion is processed within 30 days.</p><h2>Contact</h2><p>Email: <a href="mailto:bso26king@gmail.com">bso26king@gmail.com</a></p></body></html>`;

const DELETE_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Delete KCT Fitness Account</title><style>body{font-family:sans-serif;max-width:800px;margin:0 auto;padding:2rem}.box{background:#f5f5f5;padding:1rem;border-radius:8px;margin:1rem 0}</style></head><body><h1>Delete Your KCT Fitness Account</h1><div class="box"><h2>Option 1: In-App Deletion</h2><p>Open KCT Fitness &rarr; tap <strong>More</strong> &rarr; tap <strong>Delete Account</strong> &rarr; confirm twice. Your account and all data are deleted immediately.</p></div><div class="box"><h2>Option 2: Email Request</h2><p>Email <a href="mailto:bso26king@gmail.com">bso26king@gmail.com</a> with subject "Delete My Account" and your registered email. We will process within 30 days.</p></div><p><strong>Data deleted:</strong> Profile, workouts, nutrition logs, goals, and all personal information.</p></body></html>`;

app.get('/privacy-policy', (_, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(PRIVACY_HTML);
});

app.get('/delete-account', (_, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(DELETE_HTML);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`KCT Fitness API running on port ${PORT}`);
});

module.exports = app;
