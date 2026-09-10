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

const startServer = async () => {
    await connectDB();

}

startServer();

export default app;
