import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { MongoServerError } from 'mongodb';
import { MulterError } from 'multer';
import { ApiError } from '../utils/ApiError';
import { config } from '../config/env';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
  });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
    });
    return;
  }

  if (err instanceof MongoServerError && err.code === 11000) {
    res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE', message: 'Resource already exists' },
    });
    return;
  }

  if (err instanceof MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large'
        : err.code === 'LIMIT_FILE_COUNT'
          ? 'Too many files attached'
          : 'Invalid upload';
    res.status(status).json({
      success: false,
      error: { code: err.code, message },
    });
    return;
  }

  // Unexpected — log server-side, never leak internals to the client
  if (!config.isTest) {
    // eslint-disable-next-line no-console
    console.error('💥 Unhandled error:', err);
  }
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL', message: 'Something went wrong. Please try again.' },
  });
}
