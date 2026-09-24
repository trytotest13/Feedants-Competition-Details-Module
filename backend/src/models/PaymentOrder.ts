import { Document, model, Schema } from 'mongoose';

export interface PaymentOrderDocument extends Document {
  provider: 'razorpay';
  orderId: string;
  registrationId: Schema.Types.ObjectId;
  amount: number; // paise
  currency: string;
  status: 'created' | 'paid' | 'failed';
}

const paymentOrderSchema = new Schema<PaymentOrderDocument>(
  {
    provider: { type: String, enum: ['razorpay'], required: true },
    orderId: { type: String, required: true, unique: true },
    registrationId: { type: Schema.Types.ObjectId, ref: 'Registration', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
  },
  { timestamps: true },
);

export const PaymentOrder = model<PaymentOrderDocument>('PaymentOrder', paymentOrderSchema);
