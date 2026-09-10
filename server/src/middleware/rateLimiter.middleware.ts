import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per IP
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again in 15 minutes',
    errors: [],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per IP per minute
  message: {
    success: false,
    message: 'Too many requests, please slow down',
    errors: [],
  },
  standardHeaders: true,
  legacyHeaders: false,
});
