const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { env } = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Behind a reverse proxy in production. Needed for rate limiting by real client IP.
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet());

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '100kb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Only login/register are limited. /auth/me is polled by the client and must stay out of this.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' },
});
app.use(['/api/auth/login', '/api/auth/register'], authLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Hostel Management API is running' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
