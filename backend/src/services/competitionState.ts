import { CompetitionDocument } from '../models/Competition';
import { RegistrationDocument } from '../models/Registration';

export type LifecycleState =
  | 'upcoming'
  | 'registration_open'
  | 'registration_full'
  | 'awaiting_submission'
  | 'submission_open'
  | 'judging'
  | 'completed';

export type CountdownTarget =
  | 'registration_close'
  | 'submission_start'
  | 'submission_end'
  | 'result';

export interface CompetitionView {
  state: LifecycleState;
  isRegistered: boolean;
  registrationStatus: RegistrationDocument['status'] | null;
  spotsLeft: number;
  bookedCount: number;
  capacity: number;
  fillPercent: number;
  countdown: { target: CountdownTarget; endsAt: string } | null;
  flags: {
    canRegister: boolean;
    canCancel: boolean;
    canSubmit: boolean;
    hasPaidEntry: boolean;
  };
}

/**
 * Server-computed lifecycle — the single source of truth. Clients never send
 * or derive this themselves (tamper-proof + consistent across users).
 */
export function computeLifecycle(comp: CompetitionDocument, now = new Date()): LifecycleState {
  const s = comp.schedule;
  if (now < s.registrationOpenAt) return 'upcoming';
  if (now <= s.registrationCloseAt) {
    return comp.registeredCount >= comp.capacity ? 'registration_full' : 'registration_open';
  }
  if (now < s.submissionStartAt) return 'awaiting_submission';
  if (now <= s.submissionEndAt) return 'submission_open';
  if (now < s.resultAt) return 'judging';
  return 'completed';
}

/** Next milestone the UI should count down to. */
export function nextCountdown(
  comp: CompetitionDocument,
  now = new Date(),
): { target: CountdownTarget; endsAt: string } | null {
  const milestones: { target: CountdownTarget; at: Date }[] = [
    { target: 'registration_close', at: comp.schedule.registrationCloseAt },
    { target: 'submission_start', at: comp.schedule.submissionStartAt },
    { target: 'submission_end', at: comp.schedule.submissionEndAt },
    { target: 'result', at: comp.schedule.resultAt },
  ];
  const next = milestones.find((m) => m.at.getTime() > now.getTime());
  return next ? { target: next.target, endsAt: next.at.toISOString() } : null;
}

export function buildView(
  comp: CompetitionDocument,
  registration: RegistrationDocument | null,
  now = new Date(),
): CompetitionView {
  const state = computeLifecycle(comp, now);
  const active = registration && registration.active ? registration : null;
  const spotsLeft = Math.max(0, comp.capacity - comp.registeredCount);
  const fillPercent = comp.capacity === 0 ? 0 : Math.min(100, Math.round((comp.registeredCount / comp.capacity) * 100));

  const canCancel =
    !!active && comp.status !== 'cancelled' && now < comp.schedule.submissionStartAt;

  return {
    state,
    isRegistered: !!active,
    registrationStatus: active ? active.status : null,
    spotsLeft,
    bookedCount: comp.registeredCount,
    capacity: comp.capacity,
    fillPercent,
    countdown: nextCountdown(comp, now),
    flags: {
      canRegister: state === 'registration_open' && !active,
      canCancel,
      canSubmit: !!active && active.status === 'confirmed' && state === 'submission_open',
      hasPaidEntry: !!active && active.status === 'confirmed',
    },
  };
}
