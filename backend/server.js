const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const authRoutes     = require('./src/routes/auth');
const medicineRoutes = require('./src/routes/medicines');
const requestRoutes  = require('./src/routes/requests');
const adminRoutes    = require('./src/routes/admin');
const contactRoutes  = require('./src/routes/contact');

// ─── Validate required env vars before anything else ─────────────────────────
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
const missing = REQUIRED_ENV.filter(k => !process.env[k] || process.env[k].includes('<'));
if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  console.error('   Copy backend/.env.example to backend/.env and fill in all values.');
  process.exit(1);
}

if (process.env.JWT_SECRET === 'change-me' && process.env.NODE_ENV === 'production') {
  console.error('❌ JWT_SECRET is still the default value. Set a strong random secret in production.');
  process.exit(1);
}

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// ─── Trust proxy ──────────────────────────────────────────────────────────────
// Render (and most cloud platforms) route traffic through a reverse proxy.
// Without this, Express sees the proxy's IP instead of the real client IP,
// and express-rate-limit throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
// '1' means trust exactly one hop of X-Forwarded-For (the Render edge).
app.set('trust proxy', 1);

// ─── Express 5 compatible NoSQL injection sanitizer ───────────────────────────
// express-mongo-sanitize v2 is incompatible with Express 5 because it tries to
// overwrite req.query which is now a read-only getter. This inline replacement
// mutates the existing object's keys instead of replacing the reference.
const sanitizeValue = (val) => {
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    return Object.fromEntries(
      Object.entries(val)
        .filter(([k]) => !k.startsWith('$'))
        .map(([k, v]) => [k, sanitizeValue(v)])
    );
  }
  if (Array.isArray(val)) return val.map(sanitizeValue);
  return val;
};

const mongoSanitize = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  if (req.query) {
    // Express 5: req.query is read-only, so spread into a new object,
    // sanitize it, then write individual keys back onto the original object.
    const sanitized = sanitizeValue({ ...req.query });
    Object.keys(req.query).forEach(k => delete req.query[k]);
    Object.assign(req.query, sanitized);
  }
  next();
};

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images to load cross-origin
  contentSecurityPolicy: isProduction ? undefined : false, // disable CSP in dev to allow Vite HMR
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── NoSQL injection sanitization ────────────────────────────────────────────
app.use(mongoSanitize);

// ─── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// ─── Rate limiting ────────────────────────────────────────────────────────────
// Global limiter — loose ceiling to stop obvious abuse
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please wait a few minutes and try again.' },
});

// Auth routes — stricter (brute-force / OTP spam protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait 15 minutes and try again.' },
});

// Contact form — very strict
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: 'Too many contact form submissions. Please wait an hour.' },
});

app.use(globalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/contact', contactLimiter);

// ─── Static uploads ───────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: isProduction ? '7d' : 0,  // cache in prod, no cache in dev
  etag: true,
}));

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/requests',  requestRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/contact',   contactRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0=disconnected 1=connected 2=connecting 3=disconnecting
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown';
  const ok = dbState === 1;
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degraded',
    db: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
  });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status  = err.status || err.statusCode || 500;
  // Never leak stack traces to clients in production
  const message = isProduction && status >= 500
    ? 'An unexpected error occurred. Please try again later.'
    : (err.message || 'Something went wrong');

  if (status >= 500) console.error('[ERROR]', err.stack || err);
  else               console.warn('[WARN]', message);

  res.status(status).json({ message });
});

// ─── DB + server startup ──────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 5000;

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10,
  minPoolSize: 2,
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const server = app.listen(PORT, '0.0.0.0', () =>
      console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
    );

    // ── Graceful shutdown ──────────────────────────────────────────────────────
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully…`);
      server.close(async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed. Process exiting.');
        process.exit(0);
      });
      // Force exit if graceful shutdown takes > 10s
      setTimeout(() => {
        console.error('Graceful shutdown timed out. Forcing exit.');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });