import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { ENV } from '../config/env.js';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = 'Database validation error';
    errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err.code === 11000) {
    // Mongoose duplicate key error
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}. Value already exists.`;
    errors = [{ field, message }];
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for ${err.path}`;
  } else if (
    err.name === 'MongooseServerSelectionError' ||
    (err.name === 'MongooseError' && err.message?.includes('buffering timed out'))
  ) {
    statusCode = 503;
    message =
      'Database connection failed or timed out. Please ensure your IP address is whitelisted in MongoDB Atlas (Network Access -> Add IP -> 0.0.0.0/0).';
    errors = [{ field: 'database', message: err.message }];
  } else if (err.message) {
    message = err.message;
  }

  if (ENV.NODE_ENV === 'development' && statusCode === 500) {
    console.error('Unhandled Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(ENV.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
