import 'dotenv/config';
import path from 'node:path';
import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    MONGODB_URI: z.string().trim().default(''),
    JWT_SECRET: z.string().min(16).default('dev-only-jwt-secret-change-me-please'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    CORS_ORIGINS: z.string().default('*'),
    PAYMENT_MODE: z.enum(['mock', 'razorpay']).default('mock'),
    RAZORPAY_KEY_ID: z.string().default(''),
    RAZORPAY_KEY_SECRET: z.string().default(''),
    RAZORPAY_WEBHOOK_SECRET: z.string().default(''),
    PUBLIC_BASE_URL: z.string().default('http://localhost:4000'),
    UPLOAD_DIR: z.string().default('uploads'),
    MAX_UPLOAD_MB: z.coerce.number().int().positive().default(50),
    ALLOW_DB_FALLBACK: z
      .string()
      .default('true')
      .transform((v) => v !== 'false'),
    REFERRAL_REWARD_AMOUNT: z.coerce.number().int().nonnegative().default(10),
  })
  .superRefine((cfg, ctx) => {
    if (cfg.NODE_ENV === 'production' && cfg.JWT_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET must be at least 32 characters in production',
      });
    }
    if (cfg.PAYMENT_MODE === 'razorpay' && (!cfg.RAZORPAY_KEY_ID || !cfg.RAZORPAY_KEY_SECRET)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['PAYMENT_MODE'],
        message: 'PAYMENT_MODE=razorpay requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET',
      });
    }
  });

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

export const config = {
  ...env,
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  corsOrigins: env.CORS_ORIGINS === '*' ? '*' : env.CORS_ORIGINS.split(',').map((s) => s.trim()),
  /** Resolved lazily (and overridable via process.env) so tests can redirect uploads. */
  get uploadDirAbsolute(): string {
    return path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? env.UPLOAD_DIR);
  },
} as const;

export type AppConfig = typeof config;
