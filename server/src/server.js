import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config/index.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { testConnection } from './db/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === config.clientUrl ||
        origin.startsWith('http://localhost:') ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Blocked by CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser for HTTP-only JWT cookies
app.use(cookieParser());

// Request logger (in development mode)
if (config.isDev) {
  app.use(morgan('dev'));
}

// Global rate limiting
app.use('/api/', apiLimiter);

// Serve uploaded media statically
app.use('/uploads', express.static(config.uploadDir));

// Root welcome & API info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'CampusMart REST API Server',
    version: '1.0.0',
    documentation: 'See PRD.md for complete API design and schema details',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      listings: '/api/v1/listings',
      categories: '/api/v1/categories',
      wishlist: '/api/v1/me/wishlist',
      conversations: '/api/v1/conversations',
      notifications: '/api/v1/me/notifications',
      reports: '/api/v1/reports',
      admin: '/api/v1/admin',
      uploads: '/api/v1/uploads',
    },
  });
});

// Versioned API v1 Router
app.use('/api/v1', apiRouter);

// 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(globalErrorHandler);

// Start server
const server = app.listen(config.port, async () => {
  console.log(`\n🚀 CampusMart API Server running on http://localhost:${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Allowed Client Origin: ${config.clientUrl}`);
  console.log(`📁 Uploads served from: ${config.uploadDir}`);

  // Test MySQL connection status
  const dbStatus = await testConnection();
  if (dbStatus.ok) {
    console.log(`✅ Connected to MySQL database '${config.db.database}' successfully!\n`);
  } else {
    console.log(`⚠️  MySQL connection not established yet: ${dbStatus.error}`);
    console.log(`👉 To connect MySQL: Update DB_PASSWORD in server/.env and run: npm run db:init\n`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
