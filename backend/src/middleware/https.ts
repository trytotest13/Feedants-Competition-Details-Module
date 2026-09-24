import { NextFunction, Request, Response } from 'express';
import { config } from '../config/env';

/** In production, redirect plain-HTTP requests (behind a proxy) to HTTPS. */
export function httpsRedirect(req: Request, res: Response, next: NextFunction) {
  const proto = req.headers['x-forwarded-proto'] ?? req.protocol;
  if (proto !== 'https' && req.method === 'GET') {
    res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    return;
  }
  next();
}
