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
const kavita = await User.create({ name: 'Kavita Menon', email: 'kavita@example.com', passwordHash, referralCode: 'FDKAVIT' });
const arjun = await User.create({ name: 'Arjun Rao', email: 'arjun@example.com', passwordHash, referralCode: 'FDARJUN' });
const fatima = await User.create({ name: 'Fatima Sheikh', email: 'fatima@example.com', passwordHash, referralCode: 'FDFATIM' });

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

  // ── Additional competitions: every lifecycle state, live ──────────────

  // Submission window open NOW → "Upload Submission" CTA is enabled for demo user
  const photography = await Competition.create({
    slug: 'feedants-photography-challenge',
    title: 'Feedants Photography Challenge',
    category: 'Photography',
    tags: ['Solo', 'Multi-Win'],
    certificate: true,
    prizePool: 2000,
    entryFee: 79,
    capacity: 25,
    registeredCount: 14,
    judge: {
      name: 'Vikram Sethi',
      title: 'Wildlife Photographer',
      experienceYears: 18,
      avatarUrl: 'https://i.pravatar.cc/160?img=59',
      introVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
    schedule: {
      registrationOpenAt: at(-12 * DAY, 10, 0),
      registrationCloseAt: at(-5 * DAY, 23, 55),
      submissionStartAt: at(-2 * DAY, 9, 0),
      submissionEndAt: at(5 * DAY, 23, 55),
      resultAt: at(10 * DAY, 18, 0),
    },
    content: {
      about:
        'Capture a single frame that tells a whole story. ' +
        'Street, portrait, nature, abstract — any genre is welcome as long as the shot is yours. ' +
        'Upload up to three photographs during the submission window; the panel judges composition, light and narrative. ' +
        'Winning entries are featured across Feedants channels.',
      judgingParameters: [
        { name: 'Composition', weight: 30 },
        { name: 'Light & Exposure', weight: 25 },
        { name: 'Storytelling', weight: 25 },
        { name: 'Originality', weight: 20 },
      ],
      rules: [
        'Photos must be shot by the participant and un-edited beyond basic colour correction.',
        'Upload 1–3 images (JPG/PNG, max 50 MB each) before the deadline.',
        'AI-generated or stock images lead to disqualification.',
        'Only contributions from paid participants will be considered for judging.',
      ],
    },
    rewards: [
      { position: 1, label: '1st Winner', amount: 800 },
      { position: 2, label: '2nd Winner', amount: 450 },
      { position: 3, label: '3rd Winner', amount: 300 },
      { position: 4, label: '4th Winner', amount: 200 },
      { position: 5, label: '5th Winner', amount: 120 },
      { position: 6, label: '6th Winner', amount: 80 },
    ],
    disclaimer: 'Only contributions from paid participants will be considered for judging.',
    payments: {
      prizeInfoText: 'Registered users can read more',
      prizeVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      refundPolicy: 'Entry fees are non-refundable once registration is confirmed.',
      providerName: 'Razorpay',
    },
    referral: { rewardPerSignup: 10 },
    adSlot: { enabled: false },
    status: 'published',
  });

  // Judging in progress
  const painting = await Competition.create({
    slug: 'feedants-painting-masters',
    title: 'Feedants Painting Masters',
    category: 'Painting',
    tags: ['Solo'],
    certificate: true,
    prizePool: 2500,
    entryFee: 129,
    capacity: 30,
    registeredCount: 18,
    judge: {
      name: 'Sarla Bhatt',
      title: 'Contemporary Artist',
      experienceYears: 22,
      avatarUrl: 'https://i.pravatar.cc/160?img=26',
      introVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    },
    schedule: {
      registrationOpenAt: at(-20 * DAY, 10, 0),
      registrationCloseAt: at(-14 * DAY, 23, 55),
      submissionStartAt: at(-12 * DAY, 9, 0),
      submissionEndAt: at(-2 * DAY, 23, 55),
      resultAt: at(3 * DAY, 18, 0),
    },
    content: {
      about:
        'An online painting competition across watercolour, acrylic, oil and mixed media. ' +
        'Submissions are closed and the judging panel is reviewing every canvas. ' +
        'Results will be announced on the result date.',
      judgingParameters: [
        { name: 'Technique', weight: 35 },
        { name: 'Colour & Composition', weight: 30 },
        { name: 'Creativity', weight: 20 },
        { name: 'Finish', weight: 15 },
      ],
      rules: ['One artwork per participant.', 'High-resolution scan or photo required.'],
    },
    rewards: [
      { position: 1, label: '1st Winner', amount: 1000 },
      { position: 2, label: '2nd Winner', amount: 600 },
      { position: 3, label: '3rd Winner', amount: 400 },
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

  // Sold out — demonstrates the registration_full state (100% progress bar)
  const poetry = await Competition.create({
    slug: 'feedants-poetry-slam',
    title: 'Feedants Poetry Slam',
    category: 'Poetry',
    tags: ['Solo', 'Live'],
    certificate: true,
    prizePool: 1200,
    entryFee: 49,
    capacity: 15,
    registeredCount: 15,
    judge: {
      name: 'Naseem Akhtar',
      title: 'Poet & Lyricist',
      experienceYears: 14,
      avatarUrl: 'https://i.pravatar.cc/160?img=48',
      introVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    },
    schedule: {
      registrationOpenAt: at(-3 * DAY, 10, 0),
      registrationCloseAt: at(4 * DAY, 23, 55),
      submissionStartAt: at(6 * DAY, 9, 0),
      submissionEndAt: at(20 * DAY, 23, 55),
      resultAt: at(22 * DAY, 18, 0),
    },
    content: {
      about:
        'An online poetry slam in Hindi and English. All fifteen participation spots were claimed within days. ' +
        'Follow us for the next edition — referrals give you early access to future slams.',
      judgingParameters: [
        { name: 'Imagery & Metaphor', weight: 35 },
        { name: 'Rhythm & Flow', weight: 30 },
        { name: 'Emotional Impact', weight: 35 },
      ],
      rules: ['Original work only.', 'One poem per participant, max 3 minutes performed.'],
    },
    rewards: [
      { position: 1, label: '1st Winner', amount: 500 },
      { position: 2, label: '2nd Winner', amount: 300 },
      { position: 3, label: '3rd Winner', amount: 200 },
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

  // Completed — results declared
  const quiz = await Competition.create({
    slug: 'feedants-quiz-champions',
    title: 'Feedants Quiz Champions',
    category: 'Quiz',
    tags: ['Multi-Win', 'Live'],
    certificate: true,
    prizePool: 4000,
    entryFee: 59,
    capacity: 50,
    registeredCount: 50,
    judge: {
      name: 'Deepak Iyer',
      title: 'Quizmaster',
      experienceYears: 10,
      avatarUrl: 'https://i.pravatar.cc/160?img=53',
      introVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    },
    schedule: {
      registrationOpenAt: at(-30 * DAY, 10, 0),
      registrationCloseAt: at(-24 * DAY, 23, 55),
      submissionStartAt: at(-22 * DAY, 9, 0),
      submissionEndAt: at(-12 * DAY, 23, 55),
      resultAt: at(-2 * DAY, 18, 0),
    },
    content: {
      about:
        'A three-round online quiz on cinema, sports and science. This edition is complete — congratulations to the champions below! ' +
        'Watch for the next season; winners get a direct invite.',
      judgingParameters: [
        { name: 'Accuracy', weight: 50 },
        { name: 'Speed', weight: 30 },
        { name: 'Consistency', weight: 20 },
      ],
      rules: ['Solo participation.', 'Answers are time-bound; ties broken on speed.'],
    },
    rewards: [
      { position: 1, label: '1st Winner', amount: 1500 },
      { position: 2, label: '2nd Winner', amount: 900 },
      { position: 3, label: '3rd Winner', amount: 600 },
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

  // ── Registrations ─────────────────────────────────────────────────────
  // Demo user is registered for the dance competition (shows the "Registered"
  // badge, 1/20 booked in the reference design)…
  await Registration.create({
    competitionId: dance._id,
    userId: demo._id,
    status: 'confirmed',
    active: true,
    amountPaid: 99,
  });
  // …and for the photography challenge, whose submission window is open —
  // so the Upload Submission flow is demoable end-to-end.
  await Registration.create({
    competitionId: photography._id,
    userId: demo._id,
    status: 'confirmed',
    active: true,
    amountPaid: 79,
  });
  // Historical confirmed participants behind the denormalized counters
  await Registration.create([
    { competitionId: photography._id, userId: kavita._id, status: 'confirmed', active: true, amountPaid: 79 },
    { competitionId: photography._id, userId: arjun._id, status: 'confirmed', active: true, amountPaid: 79 },
    { competitionId: poetry._id, userId: kavita._id, status: 'confirmed', active: true, amountPaid: 49 },
    { competitionId: poetry._id, userId: fatima._id, status: 'confirmed', active: true, amountPaid: 49 },
    { competitionId: quiz._id, userId: rohit._id, status: 'confirmed', active: true, amountPaid: 59 },
  ]);

  // ── Previous winners for the newer competitions ───────────────────────
  await PreviousWinner.create([
    { competitionId: photography._id, name: 'Meera Joshi', position: 1, photoUrl: 'https://i.pravatar.cc/300?img=20', videoUrl: '', edition: 'Season 3' },
    { competitionId: photography._id, name: 'Sahil Khan', position: 2, photoUrl: 'https://i.pravatar.cc/300?img=33', videoUrl: '', edition: 'Season 3' },
    { competitionId: photography._id, name: 'Tara Pillai', position: 3, photoUrl: 'https://i.pravatar.cc/300?img=41', videoUrl: '', edition: 'Season 3' },
    { competitionId: quiz._id, name: 'Rohit Kulkarni', position: 1, photoUrl: 'https://i.pravatar.cc/300?img=15', videoUrl: '', edition: 'Season 2' },
    { competitionId: quiz._id, name: 'Nikhil Bansal', position: 2, photoUrl: 'https://i.pravatar.cc/300?img=8', videoUrl: '', edition: 'Season 2' },
    { competitionId: quiz._id, name: 'Ananya Gupta', position: 3, photoUrl: 'https://i.pravatar.cc/300?img=24', videoUrl: '', edition: 'Season 2' },
  ]);

  // ── Testimonials (6 total) ────────────────────────────────────────────
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
    {
      userId: kavita._id,
      name: 'Kavita Menon',
      role: 'Photography finalist',
      message: 'Uploading my entry took two minutes and the deadline countdown on the page kept me honest. Winner payouts arrived via UPI the same week.',
      avatarUrl: 'https://i.pravatar.cc/120?img=31',
      rating: 5,
    },
    {
      userId: arjun._id,
      name: 'Arjun Rao',
      role: 'Quiz Champion, Season 1',
      message: 'I referred four friends before my first quiz — the referral credits covered my entry fee. Feels like the platform wants you to win.',
      avatarUrl: 'https://i.pravatar.cc/120?img=60',
      rating: 5,
    },
    {
      userId: fatima._id,
      name: 'Fatima Sheikh',
      role: 'Poetry Slam finalist',
      message: 'Every competition page shows exactly what you get — prize split, dates, judge credentials. No fine-print surprises.',
      avatarUrl: 'https://i.pravatar.cc/120?img=49',
      rating: 4,
    },
  ]);

  // eslint-disable-next-line no-console
  console.log(
    [
      '',
      '✅ Seed complete',
      `   ${dance.title}        — registration_open (demo user registered, 1/20)`,
      `   ${photography.title} — submission_open (demo user registered → Upload demoable)`,
      `   ${poetry.title}        — registration_full (15/15, sold out)`,
      `   ${painting.title}     — judging`,
      `   ${quiz.title}       — completed`,
      `   ${singing.title}       — upcoming`,
      '   Demo login:  demo@feedants.com / Demo@1234  (registered for dance + photography)',
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

