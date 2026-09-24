/**
 * Seed script — populates the database with data matching the reference design
 * (docs/assignment/Objective_Page.png). Idempotent: clears collections first.
 *
 *   npm run seed            (uses MONGODB_URI or the in-memory dev fallback)
 *
 * Demo accounts:
 *   demo@feedants.com  / Demo@1234   (already registered for the dance competition)
 *   admin@feedants.com / Admin@1234  (role: admin)
 */
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { config } from '../config/env';
import { connectDatabase, disconnectDatabase } from '../config/db';
import { User } from '../models/User';
import { Competition } from '../models/Competition';
import { Registration } from '../models/Registration';
import { PreviousWinner } from '../models/PreviousWinner';
import { Testimonial } from '../models/Testimonial';
import { ReferralEvent } from '../models/ReferralEvent';
import { Submission } from '../models/Submission';
import { PaymentOrder } from '../models/PaymentOrder';

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

function at(offsetMs: number, hour: number, minute: number): Date {
  const d = new Date(Date.now() + offsetMs);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export async function seedDatabase(): Promise<void> {
  await Promise.all([
    User.deleteMany({}),
    Competition.deleteMany({}),
    Registration.deleteMany({}),
    PreviousWinner.deleteMany({}),
    Testimonial.deleteMany({}),
    ReferralEvent.deleteMany({}),
    Submission.deleteMany({}),
    PaymentOrder.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('Demo@1234', 12);
  const adminHash = await bcrypt.hash('Admin@1234', 12);

  const demo = await User.create({
  name: 'Demo Participant',
  email: 'demo@feedants.com',
  passwordHash,
  role: 'user',
  referralCode: 'FDDEMO1',
});
const admin = await User.create({ name: 'Feedants Admin', email: 'admin@feedants.com', passwordHash: adminHash, role: 'admin', referralCode: 'FDADMIN' });
const priya = await User.create({ name: 'Priya Nair', email: 'priya@example.com', passwordHash, referralCode: 'FDPRIYA' });
const rohit = await User.create({ name: 'Rohit Kulkarni', email: 'rohit@example.com', passwordHash, referralCode: 'FDROHIT' });
const sneha = await User.create({ name: 'Sneha Iyer', email: 'sneha@example.com', passwordHash, referralCode: 'FDSNEHA' });

  const dance = await Competition.create({
    slug: 'feedants-classical-dance',
    title: 'Feedants Classical Dance',
    category: 'Dance',
    tags: ['Multi-Win'],
    certificate: true,
    prizePool: 1500,
    entryFee: 99,
    capacity: 20,
    registeredCount: 1,
    judge: {
      name: 'Manju Dubey',
      title: 'Professional Kathak Dancer',
      experienceYears: 12,
      avatarUrl: 'https://i.pravatar.cc/160?img=47',
      introVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    },
    schedule: {
      registrationOpenAt: at(-2 * DAY, 20, 0),
      registrationCloseAt: at(1 * DAY, 18, 0),
      submissionStartAt: at(7 * DAY, 9, 0),
      submissionEndAt: at(30 * DAY, 23, 55),
      resultAt: at(31 * DAY, 23, 50),
    },
    content: {
      about:
        'This is an online classical dance competition open for all age groups. ' +
        'Participate from anywhere and showcase your talent. ' +
        'Express your passion through traditional dance. ' +
        'Record your performance, upload it during the submission window, and our panel will evaluate every entry on technique, expression and presentation. ' +
        'Winners are announced on the result date and certificates are issued to all winners.',
      judgingParameters: [
        { name: 'Technique & Precision', weight: 30 },
        { name: 'Expression & Emotion', weight: 25 },
        { name: 'Choreography & Creativity', weight: 20 },
        { name: 'Music Synchronization', weight: 15 },
        { name: 'Costume & Presentation', weight: 10 },
      ],
      rules: [
        'Participants must register and pay the entry fee before the registration deadline.',
        'Only original performances recorded by the participant are allowed.',
        'Upload 1–3 videos (max 50 MB each) during the submission window.',
        'Submissions after the deadline will not be considered for judging.',
        'Only contributions from paid participants will be considered for judging.',
        'Feedants may feature winning performances on its official channels.',
      ],
    },
    rewards: [
      { position: 1, label: '1st Winner', amount: 550 },
      { position: 2, label: '2nd Winner', amount: 300 },
      { position: 3, label: '3rd Winner', amount: 240 },
      { position: 4, label: '4th Winner', amount: 200 },
      { position: 5, label: '5th Winner', amount: 130 },
      { position: 6, label: '6th Winner', amount: 80 },
    ],
    disclaimer: 'Only contributions from paid participants will be considered for judging.',
    payments: {
      prizeInfoText: 'Registered users can read more',
      prizeVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      refundPolicy: 'Entry fees are non-refundable once registration is confirmed.',
      providerName: 'Razorpay',
    },
    referral: { rewardPerSignup: 10 },
    adSlot: { enabled: false },
    status: 'published',
  });

  await PreviousWinner.create([
    {
      competitionId: dance._id,
      name: 'Riya Shah',
      position: 1,
      photoUrl: 'https://i.pravatar.cc/300?img=25',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      edition: 'Season 4',
    },
    {
      competitionId: dance._id,
      name: 'Aarav Mehta',
      position: 1,
      photoUrl: 'https://i.pravatar.cc/300?img=12',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      edition: 'Season 4',
    },
    {
      competitionId: dance._id,
      name: 'Neha Verma',
      position: 2,
      photoUrl: 'https://i.pravatar.cc/300?img=32',
      videoUrl: '',
      edition: 'Season 4',
    },
    {
      competitionId: dance._id,
      name: 'Ishita Choudhary',
      position: 3,
      photoUrl: 'https://i.pravatar.cc/300?img=45',
      videoUrl: '',
      edition: 'Season 4',
    },
  ]);

  await Testimonial.create([
    {
      userId: priya._id,
      name: 'Priya Nair',
      role: 'Participant, Season 4',
      message: 'Feedants made it so easy to compete from home. The judging was fair and I got my certificate within days of the results!',
      avatarUrl: 'https://i.pravatar.cc/120?img=44',
      rating: 5,
    },
    {
      userId: rohit._id,
      name: 'Rohit Kulkarni',
      role: '2-time Winner',
      message: 'Transparent scoring, real prizes, and the referral discount genuinely helps. My whole dance academy competes every season now.',
      avatarUrl: 'https://i.pravatar.cc/120?img=15',
      rating: 5,
    },
    {
      userId: sneha._id,
      name: 'Sneha Iyer',
      role: 'Participant, Season 3',
      message: 'The intro videos from the judges are a lovely touch. You know exactly what the panel is looking for before you perform.',
      avatarUrl: 'https://i.pravatar.cc/120?img=27',
      rating: 4,
    },
  ]);

  // Demo user is registered (shows the "Registered" badge, 1/20 booked in the design)
  await Registration.create({
    competitionId: dance._id,
    userId: demo._id,
    status: 'confirmed',
    active: true,
    amountPaid: 99,
  });

  const singing = await Competition.create({
    slug: 'feedants-singing-star',
    title: 'Feedants Singing Star',
    category: 'Singing',
    tags: ['Solo'],
    certificate: true,
    prizePool: 3000,
    entryFee: 149,
    capacity: 50,
    registeredCount: 0,
    judge: {
      name: 'Ravi Sharma',
      title: 'Playback Singer',
      experienceYears: 15,
      avatarUrl: 'https://i.pravatar.cc/160?img=13',
      introVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    },
    schedule: {
      registrationOpenAt: at(10 * DAY, 9, 0),
      registrationCloseAt: at(24 * DAY, 23, 55),
      submissionStartAt: at(26 * DAY, 9, 0),
      submissionEndAt: at(40 * DAY, 23, 55),
      resultAt: at(42 * DAY, 12, 0),
    },
    content: {
      about: 'An online singing competition for solo performers. Details will be announced when registrations open.',
      judgingParameters: [
        { name: 'Vocal Quality', weight: 40 },
        { name: 'Sur & Taal', weight: 35 },
        { name: 'Overall Impression', weight: 25 },
      ],
      rules: ['One entry per participant.', 'Original or covered songs are allowed.'],
    },
    rewards: [
      { position: 1, label: '1st Winner', amount: 1200 },
      { position: 2, label: '2nd Winner', amount: 700 },
      { position: 3, label: '3rd Winner', amount: 500 },
    ],
    disclaimer: 'Only contributions from paid participants will be considered for judging.',
    payments: {
      prizeInfoText: 'Registered users can read more',
      prizeVideoUrl: '',
      refundPolicy: 'Entry fees are non-refundable once registration is confirmed.',
      providerName: 'Razorpay',
    },
    referral: { rewardPerSignup: 10 },
    adSlot: { enabled: false },
    status: 'published',
  });

  // eslint-disable-next-line no-console
  console.log(
    [
      '',
      '✅ Seed complete',
      `   Competitions: ${dance.title} (registration open, closes ${dance.schedule.registrationCloseAt.toLocaleString()})`,
      `                 ${singing.title} (upcoming)`,
      '   Demo login:  demo@feedants.com / Demo@1234  (already registered for the dance competition)',
      '   Admin login: admin@feedants.com / Admin@1234',
      `   Admin user id: ${admin._id}`,
      '',
    ].join('\n'),
  );
}

// CLI entry — only when run directly (node/tsx src/seed/seed.ts)
if (require.main === module) {
  connectDatabase(config.MONGODB_URI || undefined, config.ALLOW_DB_FALLBACK)
    .then(() => seedDatabase())
    .then(() => disconnectDatabase())
    .then(() => process.exit(0))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Seed failed:', err);
      process.exit(1);
    });
}

