import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { getDBStatus } from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import evidenceRoutes from './routes/evidenceRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl) or localhost dev
      callback(null, true);
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiter to /api routes
app.use('/api', apiLimiter);

// Serve evidence recordings statically
app.use('/uploads/evidence', express.static(path.resolve('uploads/evidence')));

// API Health Check
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    status: dbStatus.connected ? 'online' : 'degraded',
    appName: 'SafeVoice / SafeHer Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    instructions: !dbStatus.connected
      ? 'MongoDB is offline. Please provide your MongoDB Atlas cluster URI in backend/.env or start local MongoDB service.'
      : undefined,
  });
});

// Database connectivity check for API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/uploads') || req.path === '/api/health') {
    return next();
  }

  const { connected } = getDBStatus();
  if (!connected) {
    return res.status(503).json({
      success: false,
      isDatabaseOffline: true,
      error: 'MONGODB_OFFLINE',
      message: 'MongoDB is offline or unreachable (ECONNREFUSED). Please configure a valid MONGO_URI in backend/.env (e.g. MongoDB Atlas free cluster) or start your local MongoDB service.',
    });
  }
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
