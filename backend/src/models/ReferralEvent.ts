import { Document, model, Schema, Types } from 'mongoose';

export interface ReferralEventDocument extends Document {
  _id: Types.ObjectId;
  referrerId: Types.ObjectId;
  refereeId: Types.ObjectId;
  amount: number;
}

const referralEventSchema = new Schema<ReferralEventDocument>(
  {
    referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    refereeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

// A user can be referred exactly once (at signup)
referralEventSchema.index({ refereeId: 1 }, { unique: true });
referralEventSchema.index({ referrerId: 1 });

export const ReferralEvent = model<ReferralEventDocument>('ReferralEvent', referralEventSchema);
