/**
 * Integration tests — business rules & concurrency (vitest + supertest +
 * mongodb-memory-server). Covers the evaluation-critical paths: auth,
 * lifecycle view model, atomic capacity booking under parallel load,
 * cancel/re-register, submission window guards, referral credit,
 * field tampering protection.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.PAYMENT_MODE = 'mock';
process.env.JWT_SECRET = 'test-jwt-secret-0123456789abcdef';
process.env.PUBLIC_BASE_URL = 'http://127.0.0.1:4100';

// eslint-disable-next-line import/first
import { createApp } from '../app';
// eslint-disable-next-line import/first
import { User } from '../models/User';
// eslint-disable-next-line import/first
import { Competition } from '../models/Competition';
// eslint-disable-next-line import/first
import { Registration } from '../models/Registration';

let mongod: MongoMemoryServer;
let uploadDir: string;
const app = createApp();

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri('feedants-test'));
  uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'feedants-uploads-'));
  process.env.UPLOAD_DIR = uploadDir;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
  fs.rmSync(uploadDir, { recursive: true, force: true });
});

beforeEach(async () => {
  await Promise.all(
    mongoose.modelNames().map((name) => mongoose.model(name).deleteMany({})),
  );
});

async function createUser(email: string, name = 'Test User', password = 'Passw0rd!') {
  const user = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 4),
    referralCode: `FD${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  });
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });
  return { user, token: res.body.data.token as string };
}

async function createCompetition(overrides: Record<string, unknown> = {}) {
  const now = Date.now();
  return Competition.create({
    slug: `test-comp-${Math.random().toString(36).slice(2, 8)}`,
    title: 'Test Competition',
    category: 'Dance',
    tags: [],
    certificate: true,
    prizePool: 1000,
    entryFee: 99,
    capacity: 5,
    registeredCount: 0,
    judge: {
      name: 'Judge',
      title: 'Professional',
      experienceYears: 5,
      avatarUrl: '',
      introVideoUrl: '',
    },
    schedule: {
      registrationOpenAt: new Date(now - DAY),
      registrationCloseAt: new Date(now + DAY),
      submissionStartAt: new Date(now + 5 * DAY),
      submissionEndAt: new Date(now + 10 * DAY),
      resultAt: new Date(now + 12 * DAY),
    },
    content: { about: 'About', judgingParameters: [], rules: [] },
    rewards: [{ position: 1, label: '1st Winner', amount: 500 }],
    disclaimer: 'disclaimer',
    payments: { prizeInfoText: '', prizeVideoUrl: '', refundPolicy: '', providerName: 'Razorpay' },
    referral: { rewardPerSignup: 10 },
    adSlot: { enabled: false },
    status: 'published',
    ...overrides,
  });
}

describe('health', () => {
  it('responds ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('auth', () => {
  it('registers, logs in and returns profile with referral code', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Aarav', email: 'aarav@test.com', password: 'Passw0rd!' });
    expect(reg.status).toBe(201);
    expect(reg.body.data.token).toBeTruthy();
    expect(reg.body.data.user).not.toHaveProperty('passwordHash');
    expect(reg.body.data.user.referralCode).toMatch(/^FD/);

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'aarav@test.com', password: 'Passw0rd!' });
    expect(login.status).toBe(200);

    const me = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${login.body.data.token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe('aarav@test.com');
  });

  it('rejects duplicate email and wrong password without enumeration', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Aarav', email: 'dup@test.com', password: 'Passw0rd!' });
    const dup = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Aarav 2', email: 'dup@test.com', password: 'Passw0rd!' });
    expect(dup.status).toBe(409);

    const bad = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'dup@test.com', password: 'WrongPass1!' });
    expect(bad.status).toBe(401);
    expect(bad.body.error.message).toBe('Invalid email or password');
  });

  it('blocks field tampering with strict schemas', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Sneaky',
      email: 'sneaky@test.com',
      password: 'Passw0rd!',
      role: 'admin',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('credits the referrer ₹10 per successful referred signup', async () => {
    const referrer = await createUser('referrer@test.com', 'Referrer');
    const code = referrer.user.referralCode!;
    const join = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Newcomer', email: 'new@test.com', password: 'Passw0rd!', referralCode: code });
    expect(join.status).toBe(201);

    const me = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${referrer.token}`);
    expect(me.body.data.referral.count).toBe(1);
    expect(me.body.data.referral.earnings).toBe(10);
  });
});

describe('competition detail', () => {
  it('returns aggregated detail with computed view (anonymous)', async () => {
    const comp = await createCompetition();
    const res = await request(app).get(`/api/v1/competitions/${comp.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.competition.title).toBe('Test Competition');
    expect(res.body.data.view.state).toBe('registration_open');
    expect(res.body.data.view.spotsLeft).toBe(5);
    expect(res.body.data.view.flags.canRegister).toBe(true);
    expect(res.body.data.view.countdown.target).toBe('registration_close');
    expect(res.body.data.testimonials).toEqual([]);
  });

  it('reflects registration state for an authenticated user', async () => {
    const comp = await createCompetition();
    const { token } = await createUser('regged@test.com');
    await request(app)
      .post(`/api/v1/competitions/${comp.slug}/register`)
      .set('Authorization', `Bearer ${token}`);
    const res = await request(app)
      .get(`/api/v1/competitions/${comp.slug}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.data.view.isRegistered).toBe(true);
    expect(res.body.data.view.flags.canRegister).toBe(false);
  });

  it('404s for unknown competitions', async () => {
    const res = await request(app).get('/api/v1/competitions/nope-nope');
    expect(res.status).toBe(404);
  });
});

describe('registration lifecycle & concurrency', () => {
  it('registers, then blocks duplicate booking', async () => {
    const comp = await createCompetition();
    const { token } = await createUser('once@test.com');

    const first = await request(app)
      .post(`/api/v1/competitions/${comp.slug}/register`)
      .set('Authorization', `Bearer ${token}`);
    expect(first.status).toBe(201);
    expect(first.body.data.registration.status).toBe('confirmed');
    expect(first.body.data.view.bookedCount).toBe(1);

    const second = await request(app)
      .post(`/api/v1/competitions/${comp.slug}/register`)
      .set('Authorization', `Bearer ${token}`);
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('ALREADY_REGISTERED');
  });

  it('never overbooks under parallel load (12 users, capacity 5)', async () => {
    const comp = await createCompetition();
    const users = await Promise.all(
      Array.from({ length: 12 }, (_, i) => createUser(`racer${i}@test.com`, `Racer ${i}`)),
    );

    const results = await Promise.all(
      users.map(({ token }) =>
        request(app)
          .post(`/api/v1/competitions/${comp.slug}/register`)
          .set('Authorization', `Bearer ${token}`),
      ),
    );

    const confirmed = results.filter((r) => r.status === 201);
    const full = results.filter((r) => r.status === 409 && r.body.error.code === 'COMPETITION_FULL');
    expect(confirmed).toHaveLength(5);
    expect(full).toHaveLength(7);

    const after = await Competition.findById(comp._id);
    expect(after!.registeredCount).toBe(5);

    const count = await Registration.countDocuments({ competitionId: comp._id, active: true });
    expect(count).toBe(5);
  });

  it('marks full state, cancel frees the spot, re-registration allowed', async () => {
    const comp = await createCompetition();
    const users = await Promise.all(
      Array.from({ length: 5 }, (_, i) => createUser(`filler${i}@test.com`)),
    );
    for (const { token } of users) {
      await request(app)
        .post(`/api/v1/competitions/${comp.slug}/register`)
        .set('Authorization', `Bearer ${token}`);
    }
    const late = await createUser('late@test.com');
    const lateTry = await request(app)
      .post(`/api/v1/competitions/${comp.slug}/register`)
      .set('Authorization', `Bearer ${late.token}`);
    expect(lateTry.status).toBe(409);
    expect(lateTry.body.error.code).toBe('COMPETITION_FULL');

    const detail = await request(app).get(`/api/v1/competitions/${comp.slug}`);
    expect(detail.body.data.view.state).toBe('registration_full');

    const cancel = await request(app)
      .delete(`/api/v1/competitions/${comp.slug}/registration`)
      .set('Authorization', `Bearer ${users[0]!.token}`);
    expect(cancel.status).toBe(200);

    const reRegister = await request(app)
      .post(`/api/v1/competitions/${comp.slug}/register`)
      .set('Authorization', `Bearer ${late.token}`);
    expect(reRegister.status).toBe(201);

    const after = await Competition.findById(comp._id);
    expect(after!.registeredCount).toBe(5);
  });

  it('double-cancel is idempotent (404 on second attempt)', async () => {
    const comp = await createCompetition();
    const { token } = await createUser('cancel@test.com');
    await request(app)
      .post(`/api/v1/competitions/${comp.slug}/register`)
      .set('Authorization', `Bearer ${token}`);
    await request(app)
      .delete(`/api/v1/competitions/${comp.slug}/registration`)
      .set('Authorization', `Bearer ${token}`);
    const again = await request(app)
      .delete(`/api/v1/competitions/${comp.slug}/registration`)
      .set('Authorization', `Bearer ${token}`);
    expect(again.status).toBe(404);
  });
});

describe('submissions', () => {
  it('rejects uploads before the submission window opens', async () => {
    const comp = await createCompetition();
    const { token } = await createUser('submitter@test.com');
    await request(app)
      .post(`/api/v1/competitions/${comp.slug}/register`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .post(`/api/v1/competitions/${comp.slug}/submission`)
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'My dance')
      .attach('media', Buffer.from('fake-video'), { filename: 'a.mp4', contentType: 'video/mp4' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('SUBMISSION_WINDOW_CLOSED');
  });

  it('rejects uploads from users without a confirmed registration', async () => {
    const comp = await createCompetition();
    const { token } = await createUser('outsider@test.com');
    const res = await request(app)
      .post(`/api/v1/competitions/${comp.slug}/submission`)
      .set('Authorization', `Bearer ${token}`)
      .attach('media', Buffer.from('x'), { filename: 'a.mp4', contentType: 'video/mp4' });
    expect(res.status).toBe(403);
  });

  it('accepts an upload inside the window and replaces on re-upload', async () => {
    const comp = await createCompetition();
    const { token } = await createUser('inwindow@test.com');
    const reg = await request(app)
      .post(`/api/v1/competitions/${comp.slug}/register`)
      .set('Authorization', `Bearer ${token}`);
    expect(reg.status).toBe(201);

    // Advance the schedule: registration closed, submission window open now
    const now = Date.now();
    await Competition.findByIdAndUpdate(comp._id, {
      $set: {
        'schedule.registrationOpenAt': new Date(now - 2 * DAY),
        'schedule.registrationCloseAt': new Date(now - DAY),
        'schedule.submissionStartAt': new Date(now - HOUR),
        'schedule.submissionEndAt': new Date(now + DAY),
        'schedule.resultAt': new Date(now + 5 * DAY),
      },
    });

    const first = await request(app)
      .post(`/api/v1/competitions/${comp.slug}/submission`)
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Take 1')
      .attach('media', Buffer.from('video-1'), { filename: 'one.mp4', contentType: 'video/mp4' });
    expect(first.status).toBe(201);
    expect(first.body.data.submission.media).toHaveLength(1);

    const second = await request(app)
      .post(`/api/v1/competitions/${comp.slug}/submission`)
      .set('Authorization', `Bearer ${token}`)
      .attach('media', Buffer.from('img-2'), { filename: 'two.png', contentType: 'image/png' });
    expect(second.status).toBe(201);
    expect(second.body.data.submission.media).toHaveLength(1);
    expect(second.body.data.submission.media[0]!.kind).toBe('image');

    const mine = await request(app)
      .get(`/api/v1/competitions/${comp.slug}/submission`)
      .set('Authorization', `Bearer ${token}`);
    expect(mine.body.data.submission.media).toHaveLength(1);
  });

  it('rejects disallowed file types', async () => {
    const now = Date.now();
    const comp = await createCompetition({
      schedule: {
        registrationOpenAt: new Date(now - 2 * DAY),
        registrationCloseAt: new Date(now - DAY),
        submissionStartAt: new Date(now - HOUR),
        submissionEndAt: new Date(now + DAY),
        resultAt: new Date(now + 5 * DAY),
      },
    });
    const { token } = await createUser('badtype@test.com');
    await request(app)
      .post(`/api/v1/competitions/${comp.slug}/register`)
      .set('Authorization', `Bearer ${token}`);
    const res = await request(app)
      .post(`/api/v1/competitions/${comp.slug}/submission`)
      .set('Authorization', `Bearer ${token}`)
      .attach('media', Buffer.from('%PDF-1.4 fake'), { filename: 'evil.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('UNSUPPORTED_MEDIA');
  });
});

describe('lifecycle states', () => {
  it('reports upcoming before registration opens', async () => {
    const now = Date.now();
    const comp = await createCompetition({
      schedule: {
        registrationOpenAt: new Date(now + 2 * DAY),
        registrationCloseAt: new Date(now + 5 * DAY),
        submissionStartAt: new Date(now + 7 * DAY),
        submissionEndAt: new Date(now + 9 * DAY),
        resultAt: new Date(now + 12 * DAY),
      },
    });
    const res = await request(app).get(`/api/v1/competitions/${comp.slug}`);
    expect(res.body.data.view.state).toBe('upcoming');
    expect(res.body.data.view.flags.canRegister).toBe(false);
  });

  it('reports judging and completed after deadlines', async () => {
    const now = Date.now();
    const judging = await createCompetition({
      schedule: {
        registrationOpenAt: new Date(now - 10 * DAY),
        registrationCloseAt: new Date(now - 5 * DAY),
        submissionStartAt: new Date(now - 4 * DAY),
        submissionEndAt: new Date(now - DAY),
        resultAt: new Date(now + DAY),
      },
    });
    const resJudging = await request(app).get(`/api/v1/competitions/${judging.slug}`);
    expect(resJudging.body.data.view.state).toBe('judging');

    const completed = await createCompetition({
      schedule: {
        registrationOpenAt: new Date(now - 20 * DAY),
        registrationCloseAt: new Date(now - 15 * DAY),
        submissionStartAt: new Date(now - 14 * DAY),
        submissionEndAt: new Date(now - 10 * DAY),
        resultAt: new Date(now - DAY),
      },
    });
    const resCompleted = await request(app).get(`/api/v1/competitions/${completed.slug}`);
    expect(resCompleted.body.data.view.state).toBe('completed');
  });
});
