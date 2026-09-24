import { createHmac, timingSafeEqual } from 'node:crypto';
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { config } from '../config/env';
import { Registration } from '../models/Registration';
import { PaymentOrder } from '../models/PaymentOrder';

type RazorpayClient = { orders: { create(input: { amount: number; currency: string; receipt?: string }): Promise<{ id: string; amount: number; currency: string }> } };

async function razorpayClient(): Promise<RazorpayClient> {
  const { default: Razorpay } = await import('razorpay');
  return new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET,
  }) as unknown as RazorpayClient;
}

/**
 * POST /api/v1/payments/order { registrationId }
 * Creates a Razorpay order for a pending_payment registration (₹ amounts → paise).
 * In mock mode registration is already confirmed, so this is a no-op guard.
 */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { registrationId } = req.body as { registrationId: string };
  const registration = await Registration.findOne({
    _id: registrationId,
    userId: req.user!.id,
    active: true,
  });
  if (!registration) throw ApiError.notFound('Registration not found');
  if (registration.status === 'confirmed') {
    res.json({ success: true, data: { status: 'confirmed' } });
    return;
  }
  if (config.PAYMENT_MODE !== 'razorpay') {
    throw ApiError.badRequest('Payments are running in mock mode — registration is auto-confirmed');
  }
  const client = await razorpayClient();
  const order = await client.orders.create({
    amount: registration.amountPaid * 100,
    currency: 'INR',
    receipt: String(registration._id),
  });
  await PaymentOrder.create({
    provider: 'razorpay',
    orderId: order.id,
    registrationId: registration._id,
    amount: order.amount,
    currency: order.currency,
  });
  registration.paymentOrderId = order.id;
  await registration.save();
  res.status(201).json({
    success: true,
    data: { orderId: order.id, amount: order.amount, currency: order.currency, keyId: config.RAZORPAY_KEY_ID },
  });
});

/**
 * POST /api/v1/payments/webhook — signature-verified, idempotent payment capture.
 * Configured in the Razorpay dashboard; raw body required for HMAC verification.
 */
export const webhook = asyncHandler(async (req: Request, res: Response) => {
  const raw = req.body as Buffer;
  const signature = req.headers['x-razorpay-signature'];
  if (typeof signature !== 'string' || !config.RAZORPAY_WEBHOOK_SECRET) {
    throw ApiError.unauthorized('Invalid webhook request');
  }
  const expected = createHmac('sha256', config.RAZORPAY_WEBHOOK_SECRET).update(raw).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw ApiError.unauthorized('Invalid webhook signature');
  }

  const event = JSON.parse(raw.toString('utf8')) as {
    event: string;
    payload?: { order?: { entity?: { id?: string } } };
  };
  const orderId = event.payload?.order?.entity?.id;
  if (event.event === 'payment.captured' && orderId) {
    // Idempotent: only transition created → paid
    await PaymentOrder.findOneAndUpdate(
      { orderId, status: 'created' },
      { $set: { status: 'paid' } },
    );
    const order = await PaymentOrder.findOne({ orderId });
    if (order) {
      await Registration.updateOne(
        { _id: order.registrationId, status: 'pending_payment' },
        { $set: { status: 'confirmed' } },
      );
    }
  }
  res.json({ success: true, data: { received: true } });
});
