/** API data types — mirror backend models (backend/src/models). */

export type LifecycleState =
  | 'upcoming'
  | 'registration_open'
  | 'registration_full'
  | 'awaiting_submission'
  | 'submission_open'
  | 'judging'
  | 'completed';

export type CountdownTarget = 'registration_close' | 'submission_start' | 'submission_end' | 'result';

export interface CompetitionView {
  state: LifecycleState;
  isRegistered: boolean;
  registrationStatus: 'confirmed' | 'pending_payment' | 'cancelled' | null;
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

export interface Judge {
  name: string;
  title: string;
  experienceYears: number;
  avatarUrl: string;
  introVideoUrl: string;
}

export interface Reward {
  position: number;
  label: string;
  amount: number;
}

export interface Competition {
  _id: string;
  slug: string;
  title: string;
  category: string;
  tags: string[];
  certificate: boolean;
  prizePool: number;
  entryFee: number;
  capacity: number;
  registeredCount: number;
  judge: Judge;
  schedule: {
    registrationOpenAt: string;
    registrationCloseAt: string;
    submissionStartAt: string;
    submissionEndAt: string;
    resultAt: string;
  };
  content: {
    about: string;
    judgingParameters: { name: string; weight: number }[];
    rules: string[];
  };
  rewards: Reward[];
  disclaimer: string;
  payments: {
    prizeInfoText: string;
    prizeVideoUrl: string;
    refundPolicy: string;
    providerName: string;
  };
  referral: { rewardPerSignup: number };
  adSlot: { enabled: boolean; imageUrl?: string; link?: string };
  status: 'draft' | 'published' | 'cancelled';
}

export interface Winner {
  _id: string;
  name: string;
  position: number;
  photoUrl: string;
  videoUrl: string;
  edition: string;
}

export interface Testimonial {
  _id: string;
  name: string;
  role: string;
  message: string;
  avatarUrl: string;
  rating: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  referralCode: string | null;
  referralEarnings: number;
}

export interface ReferralInfo {
  code: string | null;
  link: string;
  count: number;
  earnings: number;
}

export interface CompetitionDetail {
  competition: Competition;
  view: CompetitionView;
  winners: Winner[];
  testimonials: Testimonial[];
}

export interface Registration {
  _id: string;
  competitionId: string;
  userId: string;
  status: 'confirmed' | 'pending_payment' | 'cancelled';
  amountPaid: number;
}

export interface Submission {
  _id: string;
  competitionId: string;
  userId: string;
  registrationId: string;
  title: string;
  media: { url: string; mime: string; size: number; kind: 'image' | 'video' }[];
  status: 'submitted' | 'replaced';
}

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: { path: string; message: string }[] };
}
