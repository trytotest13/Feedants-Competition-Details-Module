import { Document, model, Schema, Types } from 'mongoose';

export interface JudgeInfo {
  name: string;
  title: string;
  experienceYears: number;
  avatarUrl: string;
  introVideoUrl: string;
}

export interface CompetitionSchedule {
  registrationOpenAt: Date;
  registrationCloseAt: Date;
  submissionStartAt: Date;
  submissionEndAt: Date;
  resultAt: Date;
}

export interface Reward {
  position: number;
  label: string;
  amount: number;
}

export interface CompetitionAttrs {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  certificate: boolean;
  prizePool: number;
  entryFee: number;
  capacity: number;
  /** Denormalized active-registration counter — mutated only via guarded atomic $inc. */
  registeredCount: number;
  judge: JudgeInfo;
  schedule: CompetitionSchedule;
  content: {
    about: string;
    judgingParameters: { name: string; weight: number }[];
    rules: string[];
  };
  rewards: Reward[];
  disclaimer: string;
  payments: {
    prizeInfoText: string;
    prizeVideoUrl: string;
    refundPolicy: string;
    providerName: string;
  };
  referral: { rewardPerSignup: number };
  adSlot: { enabled: boolean; imageUrl?: string; link?: string };
  status: 'draft' | 'published' | 'cancelled';
}

export interface CompetitionDocument extends CompetitionAttrs, Document {
  _id: Types.ObjectId;
}

const rewardSchema = new Schema<Reward>(
  {
    position: { type: Number, required: true, min: 1 },
    label: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const competitionSchema = new Schema<CompetitionDocument>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    certificate: { type: Boolean, default: false },
    prizePool: { type: Number, required: true, min: 0 },
    entryFee: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    registeredCount: { type: Number, default: 0, min: 0 },
    judge: {
      name: { type: String, required: true },
      title: { type: String, required: true },
      experienceYears: { type: Number, required: true },
      avatarUrl: { type: String, default: '' },
      introVideoUrl: { type: String, default: '' },
    },
    schedule: {
      registrationOpenAt: { type: Date, required: true },
      registrationCloseAt: { type: Date, required: true },
      submissionStartAt: { type: Date, required: true },
      submissionEndAt: { type: Date, required: true },
      resultAt: { type: Date, required: true },
    },
    content: {
      about: { type: String, default: '' },
      judgingParameters: { type: [{ name: String, weight: Number }], default: [] },
      rules: { type: [String], default: [] },
    },
    rewards: { type: [rewardSchema], default: [] },
    disclaimer: { type: String, default: '' },
    payments: {
      prizeInfoText: { type: String, default: '' },
      prizeVideoUrl: { type: String, default: '' },
      refundPolicy: { type: String, default: '' },
      providerName: { type: String, default: 'Razorpay' },
    },
    referral: {
      rewardPerSignup: { type: Number, default: 10 },
    },
    adSlot: {
      enabled: { type: Boolean, default: false },
      imageUrl: String,
      link: String,
    },
    status: { type: String, enum: ['draft', 'published', 'cancelled'], default: 'published' },
  },
  { timestamps: true },
);

competitionSchema.index({ status: 1, 'schedule.registrationCloseAt': 1 });

competitionSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const out = ret as unknown as Record<string, unknown>;
    delete out.__v;
    return out;
  },
});

export const Competition = model<CompetitionDocument>('Competition', competitionSchema);
