import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { User, UserDocument } from '../models/User';
import { ReferralEvent } from '../models/ReferralEvent';
import { config } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { signJwt } from '../utils/jwt';

const BCRYPT_ROUNDS = 12;

function generateReferralCode(): string {
  return `FD${randomBytes(4).toString('hex').toUpperCase()}`;
}

async function createUserWithUniqueReferralCode(attrs: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<UserDocument> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await User.create({ ...attrs, referralCode: generateReferralCode() });
    } catch (err) {
      // referralCode collision → retry with a new code; email collision → surface 409
      const code = (err as { code?: number }).code;
      const keyValue = (err as { keyValue?: Record<string, unknown> }).keyValue;
      if (code === 11000 && keyValue && 'email' in keyValue) {
        throw ApiError.conflict('EMAIL_TAKEN', 'An account with this email already exists');
      }
      if (code !== 11000) throw err;
    }
  }
  throw new ApiError(500, 'REFERRAL_CODE_GENERATION_FAILED', 'Could not allocate a referral code');
}

export interface AuthResult {
  user: UserDocument;
  token: string;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}): Promise<AuthResult> {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  let referrer: UserDocument | null = null;
  if (input.referralCode) {
    referrer = await User.findOne({
      referralCode: input.referralCode.trim().toUpperCase(),
    });
    if (!referrer) {
      throw ApiError.badRequest('Invalid referral code');
    }
  }

  const user = await createUserWithUniqueReferralCode({
    name: input.name,
    email: input.email,
    passwordHash,
  });

  if (referrer) {
    // Ledger (refereeId unique index) + denormalized balance
    try {
      await ReferralEvent.create({
        referrerId: referrer._id,
        refereeId: user._id,
        amount: config.REFERRAL_REWARD_AMOUNT,
      });
      await User.updateOne(
        { _id: referrer._id },
        { $inc: { referralEarnings: config.REFERRAL_REWARD_AMOUNT } },
      );
    } catch {
      // Referral credit must never block signup; ledger audit note is sufficient in dev.
    }
  }

  return { user, token: signJwt({ sub: String(user._id), role: user.role }) };
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  // Generic message — no user enumeration
  const invalid = ApiError.unauthorized('Invalid email or password');
  if (!user) throw invalid;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw invalid;
  return { user, token: signJwt({ sub: String(user._id), role: user.role }) };
}

export async function referralSummary(user: UserDocument) {
  const referredCount = await ReferralEvent.countDocuments({ referrerId: user._id });
  return {
    code: user.referralCode,
    link: `https://feedants.com/r/${user.referralCode ?? ''}`,
    count: referredCount,
    earnings: user.referralEarnings,
  };
}
