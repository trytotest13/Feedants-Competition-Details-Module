import { Document, model, Schema, Types } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface UserAttrs {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  referralCode: string | null;
  referredBy: Types.ObjectId | null;
  referralEarnings: number;
}

export interface UserDocument extends UserAttrs, Document {
  _id: Types.ObjectId;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    referralEarnings: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Trim API responses: never expose password hash or version key
userSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const out = ret as unknown as Record<string, unknown>;
    delete out.passwordHash;
    delete out.__v;
    return out;
  },
});

export const User = model<UserDocument>('User', userSchema);
