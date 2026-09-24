import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

const json = (message: string) => ({
  success: false,
  error: { code: 'RATE_LIMITED', message },
});

/** Global API limiter */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => config.isTest,
  message: json('Too many requests — please slow down'),
});

/** Strict limiter for credential endpoints (brute-force / bot mitigation) */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => config.isTest,
  message: json('Too many attempts — try again in 15 minutes'),
});
