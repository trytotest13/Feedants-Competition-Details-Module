import { Document, model, Schema, Types } from 'mongoose';

export interface SubmissionMedia {
  url: string;
  mime: string;
  size: number;
  kind: 'image' | 'video';
}

export interface SubmissionDocument extends Document {
  _id: Types.ObjectId;
  competitionId: Types.ObjectId;
  userId: Types.ObjectId;
  registrationId: Types.ObjectId;
  title: string;
  media: SubmissionMedia[];
  status: 'submitted' | 'replaced';
}

const mediaSchema = new Schema<SubmissionMedia>(
  {
    url: { type: String, required: true },
    mime: { type: String, required: true },
    size: { type: Number, required: true },
    kind: { type: String, enum: ['image', 'video'], required: true },
  },
  { _id: false },
);

const submissionSchema = new Schema<SubmissionDocument>(
  {
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    registrationId: { type: Schema.Types.ObjectId, ref: 'Registration', required: true },
    title: { type: String, trim: true, maxlength: 120, default: '' },
    media: { type: [mediaSchema], default: [] },
    status: { type: String, enum: ['submitted', 'replaced'], default: 'submitted' },
  },
  { timestamps: true },
);

// One submission per user per competition (re-upload updates the same document)
submissionSchema.index({ competitionId: 1, userId: 1 }, { unique: true });

submissionSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const out = ret as unknown as Record<string, unknown>;
    delete out.__v;
    return out;
  },
});

export const Submission = model<SubmissionDocument>('Submission', submissionSchema);
