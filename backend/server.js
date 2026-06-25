const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const medicineRoutes = require('./src/routes/medicines');
const requestRoutes = require('./src/routes/requests');
const adminRoutes = require('./src/routes/admin');
const contactRoutes = require('./src/routes/contact');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' }));

app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = status >= 500 ? 'Internal server error' : (err.message || 'Something went wrong');

  if (status >= 500) {
    console.error(err.stack || err);
  } else {
    console.warn(message);
  }

  res.status(status).json({ message });
});

const PORT = Number(process.env.PORT) || 5000;
const uri = process.env.MONGODB_URI;

if (isProduction && !process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET must be set in production.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev-secret-change-me';
}

if (!uri || uri.includes('<username>')) {
  console.error('❌ MONGODB_URI is not set in backend/.env — please add your Atlas connection string.');
  process.exit(1);
}

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on http://0.0.0.0:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });