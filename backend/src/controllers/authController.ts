import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { referralSummary, loginUser, registerUser } from '../services/authService';

/** POST /api/v1/auth/register */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { name: string; email: string; password: string; referralCode?: string };
  const { user, token } = await registerUser(body);
  res.status(201).json({ success: true, data: { user, token } });
});

/** POST /api/v1/auth/login */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { email: string; password: string };
  const { user, token } = await loginUser(body.email, body.password);
  res.json({ success: true, data: { user, token } });
});

/** GET /api/v1/auth/me */
export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!.doc;
  const referral = await referralSummary(user);
  res.json({ success: true, data: { user, referral } });
});
