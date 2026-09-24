import { Types } from 'mongoose';
import { Competition, CompetitionDocument } from '../models/Competition';
import { Registration, RegistrationDocument } from '../models/Registration';
import { computeLifecycle } from './competitionState';
import { config } from '../config/env';
import { ApiError } from '../utils/ApiError';

/**
 * Book a spot — race-safe under any interleaving:
 *  1. unique partial index {competitionId, userId} where active=true blocks
 *     duplicate bookings across concurrent requests AND API replicas;
 *  2. guarded atomic $inc (registeredCount < capacity) can never overbook;
 *  3. if the $inc loses the capacity race, the just-created booking is released.
 * Spot is held during payment (pending_payment); mock mode confirms instantly.
 */
export async function registerForCompetition(
  userId: Types.ObjectId,
  comp: CompetitionDocument,
): Promise<RegistrationDocument> {
  if (comp.status === 'cancelled') {
    throw ApiError.conflict('COMPETITION_CANCELLED', 'This competition has been cancelled');
  }
  const state = computeLifecycle(comp);
  if (state === 'registration_full') {
    throw ApiError.conflict('COMPETITION_FULL', 'All participation spots are taken');
  }
  if (state !== 'registration_open') {
    throw ApiError.conflict(
      'REGISTRATION_CLOSED',
      `Registration is not open — competition is currently "${state}"`,
    );
  }

  let registration: RegistrationDocument;
  try {
    registration = await Registration.create({
      competitionId: comp._id,
      userId,
      status: config.PAYMENT_MODE === 'razorpay' ? 'pending_payment' : 'confirmed',
      active: true,
      amountPaid: comp.entryFee,
    });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      throw ApiError.conflict('ALREADY_REGISTERED', 'You are already registered for this competition');
    }
    throw err;
  }

  const updated = await Competition.findOneAndUpdate(
    { _id: comp._id, registeredCount: { $lt: comp.capacity } },
    { $inc: { registeredCount: 1 } },
    { new: true },
  );
  if (!updated) {
    // Lost a concurrent capacity race — release the booking we just made.
    await Registration.deleteOne({ _id: registration._id });
    throw ApiError.conflict('COMPETITION_FULL', 'All participation spots are taken');
  }
  // Reflect the incremented counter on the caller's copy
  comp.registeredCount = updated.registeredCount;
  return registration;
}

/**
 * Cancel an active booking (idempotent transition) and release the spot.
 * Allowed only before the submission window starts.
 */
export async function cancelRegistration(
  userId: Types.ObjectId,
  comp: CompetitionDocument,
): Promise<void> {
  if (new Date() >= comp.schedule.submissionStartAt) {
    throw ApiError.conflict(
      'CANCELLATION_CLOSED',
      'Registration can no longer be cancelled — submissions have started',
    );
  }
  const cancelled = await Registration.findOneAndUpdate(
    { competitionId: comp._id, userId, active: true, status: { $in: ['confirmed', 'pending_payment'] } },
    { $set: { status: 'cancelled', active: false } },
    { new: true },
  );
  if (!cancelled) {
    throw ApiError.notFound('You have no active registration for this competition');
  }
  await Competition.updateOne(
    { _id: comp._id, registeredCount: { $gt: 0 } },
    { $inc: { registeredCount: -1 } },
  );
}
