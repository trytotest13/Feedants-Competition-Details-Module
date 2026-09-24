import compression from 'compression';
import cors from 'cors';
import express, { Express } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'node:fs';
import { config } from './config/env';
import { httpsRedirect } from './middleware/https';
import { apiLimiter } from './middleware/rateLimit';
import { errorHandler, notFound } from './middleware/error';
import routes from './routes';
import { webhook } from './controllers/paymentController';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  if (config.isProd) app.use(httpsRedirect);
  app.disable('x-powered-by');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // Razorpay webhook needs the raw body for HMAC verification — mount before json parser
  app.post('/api/v1/payments/webhook', express.raw({ type: '*/*', limit: '1mb' }), webhook);

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(mongoSanitize());
  app.use(
    cors({
      origin: config.corsOrigins === '*' ? true : config.corsOrigins,
      methods: ['GET', 'POST', 'DELETE'],
    }),
  );
  if (!config.isTest) app.use(morgan(config.isProd ? 'combined' : 'dev'));
  app.use(compression());
  app.use(apiLimiter);

  // Uploaded submissions (strictly media, non-executable directory)
  fs.mkdirSync(config.uploadDirAbsolute, { recursive: true });
  app.use(
    '/uploads',
    express.static(config.uploadDirAbsolute, { maxAge: '7d' }),
  );

  app.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', env: config.NODE_ENV } });
  });

  app.use('/api/v1', routes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
