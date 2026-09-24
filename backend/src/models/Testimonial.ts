import { Document, model, Schema, Types } from 'mongoose';

export interface TestimonialDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId | null;
  name: string;
  role: string;
  message: string;
  avatarUrl: string;
  rating: number;
}

const testimonialSchema = new Schema<TestimonialDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    role: { type: String, trim: true, maxlength: 80, default: 'Participant' },
    message: { type: String, required: true, trim: true, maxlength: 280 },
    avatarUrl: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5, default: 5 },
  },
  { timestamps: true },
);

testimonialSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const out = ret as unknown as Record<string, unknown>;
    delete out.__v;
    return out;
  },
});

export const Testimonial = model<TestimonialDocument>('Testimonial', testimonialSchema);
