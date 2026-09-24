import { Document, model, Schema, Types } from 'mongoose';

export interface PreviousWinnerDocument extends Document {
  _id: Types.ObjectId;
  competitionId: Types.ObjectId;
  name: string;
  /** 1 = first winner; two entries may share a position across editions/categories. */
  position: number;
  photoUrl: string;
  videoUrl: string;
  edition: string;
}

const previousWinnerSchema = new Schema<PreviousWinnerDocument>(
  {
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
    name: { type: String, required: true, trim: true },
    position: { type: Number, required: true, min: 1 },
    photoUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    edition: { type: String, default: '' },
  },
  { timestamps: true },
);

previousWinnerSchema.index({ competitionId: 1, position: 1 });

previousWinnerSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const out = ret as unknown as Record<string, unknown>;
    delete out.__v;
    return out;
  },
});

export const PreviousWinner = model<PreviousWinnerDocument>('PreviousWinner', previousWinnerSchema);
