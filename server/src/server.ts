import express, {Request, Response} from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import v1Routes from './routes/index.js';
import { apiRateLimiter } from './middleware/rateLimiter.middleware.js';

const app = express();
app.use(morgan('dev'));

app.use(helmet());
app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for API requests
app.use('/api', apiRateLimiter);

// API Routes
app.use('/api/v1', v1Routes);

// Root greeting
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to EduBatch API Platform',
    documentation: '/api/v1/health',
    version: '1.0.0',
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    errors: [],
  });
});

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

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }
}

startServer();

export default app;
