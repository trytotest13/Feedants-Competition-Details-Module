# Schema — MongoDB Data Model

Naming: collections plural, snake-free camelCase fields. All timestamps: `createdAt`/`updatedAt` (Mongoose).

## users

| Field | Type | Constraints |
|---|---|---|
| name | String | required, trim, ≤80 |
| email | String | required, unique (lowercase), normalized |
| passwordHash | String | required (bcrypt cost 12) — **never** returned by API |
| role | String | enum `user`/`admin`, default `user` |
| referralCode | String | unique, sparse — generated `FD<6 alnum>` |
| referredBy | ObjectId → users | nullable |
| referralEarnings | Number | default 0 (sum of ledger; denormalized) |

Indexes: `email` unique · `referralCode` unique sparse.

## competitions

| Field | Type | Notes |
|---|---|---|
| slug | String | unique, URL key |
| title | String | required |
| category | String | e.g. "Dance" |
| tags | [String] | e.g. ["Multi-Win"] |
| certificate | Boolean | "Winners get certificate" chip |
| prizePool | Number | ₹ |
| entryFee | Number | ₹ |
| capacity | Number | total participation spots |
| registeredCount | Number | **denormalized counter** — mutated only via atomic `$inc` with capacity guard |
| judge | { name, title, experienceYears, avatarUrl, introVideoUrl } | |
| schedule | { registrationOpenAt, registrationCloseAt, submissionStartAt, submissionEndAt, resultAt } | all required ISO dates; `submissionStartAt > registrationCloseAt` |
| content | { about, judgingParameters: [{name, weight}], rules: [String] } | |
| rewards | [{ position: Number, label: String, amount: Number }] | sorted by position |
| disclaimer | String | |
| payments | { prizeInfoText, prizeVideoUrl, refundPolicy, providerName } | "Razorpay" |
| referral | { rewardPerSignup: Number } | ₹10 |
| adSlot | { enabled: Boolean, imageUrl?, link? } | disabled → dashed placeholder |
| status | String | enum `draft`/`published`/`cancelled`, default `published` |

Indexes: `slug` unique · `status` + `schedule.registrationCloseAt` (list queries).

## registrations

| Field | Type | Notes |
|---|---|---|
| competitionId | ObjectId → competitions | required |
| userId | ObjectId → users | required |
| status | String | enum `confirmed`/`pending_payment`/`cancelled` |
| amountPaid | Number | entry fee at booking time |
| paymentOrderId | String | razorpay order id (razorpay mode) |

**Indexes:**
- `{ competitionId: 1, userId: 1 }` **unique** with `partialFilterExpression: { status: { $in: ["confirmed","pending_payment"] } }` → DB-level guarantee: one active registration per user per competition, even under races; re-registration allowed after `cancelled` (doc retained for audit).
- `{ competitionId: 1, status: 1 }` — capacity reconciles/list counts.

## submissions

| Field | Type | Notes |
|---|---|---|
| competitionId / userId / registrationId | ObjectId | registration must be `confirmed` |
| title | String | optional, trim ≤120 |
| media | [{ url, mime, size, kind: `image`/`video` }] | validated server-side |
| status | String | `submitted` / `replaced` |

Index: `{ competitionId, userId }` unique → one submission per user; re-upload replaces (old marked `replaced`).

## previous_winners

{ competitionId, name, position: Number (1=1st), photoUrl, videoUrl? , edition: String }
Index: `{ competitionId, position }`.

## referral_events

{ referrerId → users, refereeId → users, amount, createdAt }
Index: `refereeId` unique (a user can be referred once) · `referrerId` for earnings aggregation. Referrer ledger + `referralEarnings` increment inside one transactional flow (signup).

## testimonials

{ userId?, name, role, message (≤280), avatarUrl?, rating 1–5 }

## payment_orders

{ provider, orderId (unique), registrationId, amount, status: `created`/`paid`/`failed`, rawEvent? } — idempotent webhook processing keyed on `orderId`.

## Security policies on data

- `passwordHash` excluded via schema `toJSON` transform; `__v` stripped everywhere.
- Ownership scoping: submissions/registrations always queried with `userId` of the JWT principal (record-level lock; MongoDB has no RLS, equivalent enforced in every query + tested).
- Server-computed fields (`registeredCount`, `status`, lifecycle) are **never accepted** from request bodies.
- All queries parameterized through Mongoose (no string-built queries); `express-mongo-sanitize` strips `$`/`.` operators.

## Seed data (matches reference design)

- Competition `feedants-classical-dance` — ₹1,500 pool, ₹99 fee, capacity 20, judge **Manju Dubey**, rewards 1st–6th (₹550/300/240/200/130/80), previous winners Riya Shah / Aarav Mehta / Neha Verma / Ishita Choudhary, 3 testimonials, ad slot disabled, relative dates: registration closes **+1d 06h 28m** (live countdown), submission window in future, result later.
- Users: `demo@feedants.com` / `Demo@1234` (already registered → shows **Registered** badge), `admin@feedants.com` / `Admin@1234` (role admin), 3 testimonial authors.
- Second competition (`feedants-singing-star`) seeded `upcoming` to demonstrate alternate lifecycle state in the list.
