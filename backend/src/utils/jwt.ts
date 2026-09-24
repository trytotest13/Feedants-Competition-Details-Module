import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface JwtPayload {
  sub: string;
  role: 'user' | 'admin';
}

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
}
