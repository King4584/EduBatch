import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import v1Routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiRateLimiter } from './middleware/rateLimiter.middleware.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      // Allow localhost, local IP, any vercel.app deployment, or configured CLIENT_URL
      if (
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.endsWith('.vercel.app') ||
        origin === ENV.CLIENT_URL
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan(ENV.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Body parsing
app.use(
  express.json({
    limit: '10mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for API requests
app.use('/api', apiRateLimiter);

// Root greeting
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to EduBatch API Platform',
    documentation: '/api/v1/health',
    version: '1.0.0',
  });
});

// API Routes: mount at /api/v1, /api, and / so both /api/v1/auth/login and /auth/login work seamlessly!
app.use('/api/v1', v1Routes);
app.use('/api', v1Routes);
app.use('/', v1Routes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    errors: [],
  });
});

// Global Centralized Error Handler
app.use(errorHandler);

// Start Server
const startServer = async () => {
  await connectDB();
  const server = app.listen(ENV.PORT, () => {
    console.log(`[EduBatch Server] Running in ${ENV.NODE_ENV} mode on http://localhost:${ENV.PORT}`);
    console.log(`[EduBatch Server] API Base: http://localhost:${ENV.PORT}/api/v1`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('[EduBatch Server] Shutting down gracefully...');
    server.close(() => {
      console.log('[EduBatch Server] Closed out remaining connections.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();

export default app;
