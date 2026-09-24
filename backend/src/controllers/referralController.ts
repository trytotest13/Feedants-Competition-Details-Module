import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { referralSummary } from '../services/authService';

/** GET /api/v1/referrals/me */
export const myReferrals = asyncHandler(async (req: Request, res: Response) => {
  const referral = await referralSummary(req.user!.doc);
  res.json({ success: true, data: { referral } });
});
