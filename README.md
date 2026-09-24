# Feedants — Competition Details Module (Full-Stack)

Submission for the **Feedants Full Stack Development Internship Technical Assignment**: the
Competition Details screen built as a **functional full-stack feature** — React Native frontend,
Node.js/Express backend, MongoDB — with dynamic server-driven data, real business rules, and
concurrency-safe registration.

Reference design: [`docs/assignment/Objective_Page.png`](docs/assignment/Objective_Page.png) ·
Assignment PDF: [`docs/assignment/`](docs/assignment)

| Layer | Tech |
|---|---|
| Mobile | React Native 0.81 · Expo SDK 54 · expo-router · TypeScript strict · @tanstack/react-query · Poppins |
| Backend | Node.js · Express 4 · TypeScript strict · Zod · JWT (jsonwebtoken) · bcryptjs · multer · helmet |
| Database | MongoDB (Mongoose 8) — Atlas / local / Docker, **or zero-setup in-memory fallback in dev** |
| Payments | `PAYMENT_MODE=mock` (auto-confirm, Expo Go friendly) or Razorpay order + signature-verified webhook |
| Tests | Vitest + supertest + mongodb-memory-server — **21 integration tests incl. a parallel-booking race test** |

---

## 1. Quick start

### Backend (API + auto-seed)

```bash
cd backend
npm install
npm run dev
```

That's it. With no `MONGODB_URI`, the server boots an **isolated in-memory MongoDB** and seeds it
with the design-matching demo data on first start — the API is live at
`http://localhost:4000/api/v1`.

To use a persistent database instead:

```bash
cp .env.example .env            # then set MONGODB_URI (Atlas / local / Docker), JWT_SECRET
npm run seed                    # populate demo data
npm run dev
```

Demo accounts (created by the seed):

| Account | Email | Password | Notes |
|---|---|---|---|
| Participant | `demo@feedants.com` | `Demo@1234` | **Already registered** for the dance competition (shows the Registered badge) |
| Admin | `admin@feedants.com` | `Admin@1234` | `role: admin` |

### Mobile app (Expo Go / simulator / web)

```bash
cd mobile
npm install
cp .env.example .env            # set EXPO_PUBLIC_API_URL (see table below)
npx expo start
```

| Environment | `EXPO_PUBLIC_API_URL` |
|---|---|
| Web export / iOS simulator | `http://localhost:4000/api/v1` |
| Android emulator | `http://10.0.2.2:4000/api/v1` |
| Physical device (Expo Go) | `http://<your-lan-ip>:4000/api/v1` |

Then press `w` (web), `i` (iOS simulator), `a` (Android emulator), or scan the QR code with
**Expo Go**. Log in with the demo account (credentials are prefilled on the login screen).

Web build without dev server: `npm run export:web` → serve `mobile/dist/` statically.

### Tests

```bash
cd backend && npm test
```

Covers: auth (register/login/me, duplicate email, referral credit), lifecycle states,
registration & cancellation, **concurrency race (12 parallel registrations on capacity 5 →
exactly 5 confirmed)**, submission window guards, upload type validation, field-tampering
protection.

---

## 2. What is functional (not hardcoded)

Every value on the screen comes from `GET /api/v1/competitions/:idOrSlug`, which returns the
competition, a **server-computed view model**, previous winners and testimonials in one
consistent snapshot:

- **Lifecycle state machine** (server-computed per request): `upcoming → registration_open →
  registration_full → awaiting_submission → submission_open → judging → completed` (+ cancelled).
  The UI's CTA, banner and copy switch on it — e.g. registration closed → disabled CTA with the
  next date; submissions open → enabled Upload Submission.
- **Remaining spots / progress**: capacity enforced by an atomic conditional update
  (`registeredCount < capacity → $inc`), so "Only 19 spots left" and "1 / 20 Booked" stay correct
  under any number of concurrent users. A unique **partial index** (`active: true` per
  user+competition) makes duplicate booking impossible at the database level — even across
  multiple API replicas.
- **Live countdown** anchored to server timestamps (`registrationCloseAt`); ticks locally and
  re-syncs on refetch/focus.
- **Registration** (POST) books the spot + entry-fee payment (mock/razorpay); **cancellation**
  (DELETE) is window-checked, idempotent, and releases the spot for others.
- **Submissions**: only paid registrations, only inside the submission window, max 3 files of
  `jpg/png/webp/mp4/mov` ≤ 50 MB, re-upload replaces (one submission per user).
- **Referrals**: code generated per user, applied at signup, ₹10 credited to the referrer
  (ledger + balance), link copy/share from the app.
- **ENG / हिंदी toggle** switches every interface label instantly.

## 3. API summary (`/api/v1`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` · `/auth/login` | — | Account creation (optional referral code) / login |
| GET | `/auth/me` | ✅ | Profile + referral summary |
| GET | `/competitions` | optional | Paginated list with computed state |
| GET | `/competitions/:idOrSlug` | optional | Aggregated detail (competition + view + winners + testimonials) |
| POST | `/competitions/:idOrSlug/register` | ✅ | Atomic spot booking + payment |
| DELETE | `/competitions/:idOrSlug/registration` | ✅ | Cancel (frees spot) |
| POST / GET | `/competitions/:idOrSlug/submission` | ✅ | Upload (multipart) / fetch my submission |
| GET | `/referrals/me` | ✅ | Referral code, link, count, earnings |
| POST | `/payments/order` · `/payments/webhook` | ✅ / sig | Razorpay order / signature-verified webhook |

Envelope: `{ success, data | error: { code, message } }`. Errors: 400 validation (field details),
401, 403, 404, 409 business conflicts (`ALREADY_REGISTERED`, `COMPETITION_FULL`,
`REGISTRATION_CLOSED`), 422 window/media rules, 429 rate-limited.

## 4. Assumptions

1. **Payments**: real Razorpay capture is out of scope for a runnable demo; `PAYMENT_MODE=mock`
   auto-confirms so the full registration flow works in Expo Go. The Razorpay path (order
   creation + HMAC-verified idempotent webhook) is implemented server-side behind env keys —
   only the in-app checkout SDK is not wired.
2. **Spot semantics**: a booking (paid or awaiting payment) holds a spot; cancelling or never
   paying releases it. `registeredCount` is a denormalized counter maintained only by guarded
   atomic operations.
3. **Referral reward** is credited to the referrer at signup time (₹10 default, per-competition
   override field exists); "discount" is interpreted as referrer earnings, matching the design
   copy "You earn ₹10 for every signup".
4. **Seed dates are relative to seed time** (registration closes ~1d later) so the live countdown
   and open states are always demonstrable; the second seeded competition demonstrates `upcoming`.
5. **Media/avatars** use stable public sample URLs with graceful initial-fallbacks; uploads are
   stored on disk in dev (`backend/uploads/`, gitignored) — object storage in production.
6. One **active** registration per user per competition; re-registering after a cancellation is
   allowed (that's why the uniqueness is a partial index on `active: true`).

## 5. Major technical decisions

- **Server-computed view model** — the client never derives state (tamper-proof, consistent
  across thousands of users, trivially cacheable). One aggregated detail endpoint renders the
  whole screen from an atomic snapshot.
- **Concurrency**: DB constraints over application locks — unique partial index blocks duplicate
  bookings; conditional `$inc` blocks overbooking; a lost capacity race rolls back the just-made
  booking. Verified by the parallel race test.
- **Expo SDK 54 + expo-router** for instant run via Expo Go (no native build needed to evaluate);
  also exports to web for review. Token stored in `expo-secure-store` (Keychain/Keystore).
- **Strict TypeScript end-to-end**, layered backend (routes → zod validators → controllers →
  services → models), shared design tokens on the client.
- **Security posture** — see [`SECURITY.md`](SECURITY.md) for the full checklist mapping
  (bcrypt-12, rate limits, helmet, sanitization, strict zod schemas, ownership scoping, upload
  restrictions, trimmed responses, HTTPS enforcement in production, no secrets in git).

## 6. Trade-offs considered

- **Denormalized `registeredCount` vs counting registrations per request** — chose the counter
  (O(1) reads, single atomic write) with reconcile-by-count as the documented ops fallback.
- **JWT-only auth (7d) vs refresh-token rotation** — simpler demo surface; rotation is the first
  production upgrade.
- **In-memory DB fallback** vs requiring a running MongoDB — massively improves "run in 2
  minutes"; production always sets `MONGODB_URI`.
- **multer/disk uploads** vs S3 signed URLs — zero-config demo; the swap is isolated in the
  controller.
- **Server-rendered content in one language** vs full CMS i18n — UI labels are bilingual;
  translating campaign content is a backend concern deferred as out of scope.

## 7. If developed further for production

- Refresh-token rotation + device session management; CAPTCHA/bot scoring on auth + registration.
- Razorpay checkout SDK in-app, refund execution, payout scheduling for prize money.
- Object storage (S3/Cloudinary) with signed URLs + virus scanning for submissions; media
  transcode pipeline.
- Horizontal scaling checklist already safe (stateless API + DB-level invariants); add Redis
  caching for the detail endpoint, pagination cursors, and OpenTelemetry tracing.
- Admin dashboard for competition CRUD (a `role: admin` guard already exists), results/judging
  engine, push notifications for deadline reminders, and full content i18n.
- CI: `npm audit` gate, gitleaks secret scanning, typecheck + tests on PR (scripts are ready).

## 8. Project structure

```
├── backend/            Express + Mongoose API (src: config, models, routes, controllers,
│                       services, middleware, validators, utils, seed, tests)
├── mobile/             Expo app (app/: routes; src/: api, auth, hooks, i18n, theme, components)
├── docs/               Planning framework (prd, trd, architecture, design, schema,
│                       implementation, todo, rules) + assignment reference
├── .env.example        Documents every environment variable (names only)
├── .gitignore          Comprehensive: secrets/env, deps, builds, uploads, logs, OS, IDE
└── SECURITY.md         Pre-deploy security checklist mapped to this implementation
```

> **Screen recording**: run the backend (`npm run dev`) and app (`npx expo start`), log in as the
> demo user, open *Feedants Classical Dance* — the Registered badge, live countdown, spot
> progress, tabs, referral copy and the Upload Submission flow are all demonstrable; registering
> a second fresh account shows the Register → pay → spots-decrement flow live.
#
