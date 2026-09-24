import { Document, model, Schema, Types } from 'mongoose';

export type RegistrationStatus = 'confirmed' | 'pending_payment' | 'cancelled';

export interface RegistrationAttrs {
  competitionId: Types.ObjectId;
  userId: Types.ObjectId;
  status: RegistrationStatus;
  /** Active bookings only — partial unique index below makes duplicates impossible. */
  active: boolean;
  amountPaid: number;
  paymentOrderId?: string;
}

export interface RegistrationDocument extends RegistrationAttrs, Document {
  _id: Types.ObjectId;
}

const registrationSchema = new Schema<RegistrationDocument>(
  {
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['confirmed', 'pending_payment', 'cancelled'], required: true },
    active: { type: Boolean, default: true },
    amountPaid: { type: Number, default: 0 },
    paymentOrderId: { type: String, default: '' },
  },
  { timestamps: true },
);

// DB-level concurrency guarantee: at most ONE active booking per user per competition,
// across any number of concurrent requests / API replicas. `active` (instead of status)
// keeps the partial filter a supported equality expression and allows re-registration
// after cancellation.
registrationSchema.index(
  { competitionId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { active: true }, name: 'uniq_active_user_per_competition' },
);
registrationSchema.index({ competitionId: 1, status: 1 });
registrationSchema.index({ userId: 1, status: 1 });

registrationSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const out = ret as unknown as Record<string, unknown>;
    delete out.__v;
    return out;
  },
});

export const Registration = model<RegistrationDocument>('Registration', registrationSchema);
