import { NextFunction, Request, Response } from 'express';
import { User, UserDocument } from '../models/User';
import { verifyJwt } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

export interface RequestUser {
  id: string;
  role: 'user' | 'admin';
  doc: UserDocument;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

/** Hard auth — 401 unless a valid bearer token belonging to a live user. */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) throw ApiError.unauthorized();
    let payload;
    try {
      payload = verifyJwt(token);
    } catch {
      throw ApiError.unauthorized('Session expired — please sign in again');
    }
    const doc = await User.findById(payload.sub);
    if (!doc) throw ApiError.unauthorized('Account no longer exists');
    req.user = { id: String(doc._id), role: doc.role, doc };
    next();
  } catch (err) {
    next(err);
  }
}

/** Soft auth — attaches user when a valid token is present, never fails. */
export async function attachUserIfPresent(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (token) {
      const payload = verifyJwt(token);
      const doc = await User.findById(payload.sub);
      if (doc) req.user = { id: String(doc._id), role: doc.role, doc };
    }
  } catch {
    // Anonymous access is fine for optional-auth endpoints
  }
  next();
}

export function requireRole(role: 'admin') {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (req.user.role !== role) return next(ApiError.forbidden());
    next();
  };
}
