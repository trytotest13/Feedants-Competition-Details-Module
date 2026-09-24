# Architecture

## 1. System overview

```
┌───────────────────────────┐        HTTPS/JSON         ┌──────────────────────────────┐
│  React Native (Expo) app  │  ───────────────────────▶ │  Express API (stateless)     │
│  expo-router · RN query   │   /api/v1/*  JWT bearer   │  routes→validators→controllers│
│  SecureStore token        │  ◀─────────────────────── │  →services→models (Mongoose) │
└───────────────────────────┘   computed view models     └──────────────┬───────────────┘
        │  uploads (multipart)                                          │
        └──────────────────────────▶ /uploads (disk in dev)             ▼
                                                     MongoDB (replica set in prod)
                                          unique indexes + atomic conditional updates
                                                     ▲
                                          Razorpay webhook (signature-verified)
```

**Rendering strategy:** client-rendered native UI; the server owns **derived state** (lifecycle, spots, flags, countdown anchors). One aggregated `GET /competitions/:idOrSlug` returns everything the screen needs (competition + view model + winners + testimonials) — fewer round trips, atomic snapshot, cache-friendly.

## 2. Directory tree

```
├── docs/                       # planning docs (this framework) + assignment reference
├── backend/
│   ├── src/
│   │   ├── config/             # env (zod-validated), db (Atlas/local/memory fallback)
│   │   ├── models/             # User, Competition, Registration, Submission, Testimonial, PreviousWinner, ReferralEvent, PaymentOrder
│   │   ├── routes/             # /auth /competitions /referrals /payments
│   │   ├── controllers/        # HTTP layer: parse → validate → service → respond
│   │   ├── services/           # business logic: competitionState, registrationService, referralService
│   │   ├── middleware/         # auth, validate(zod), error, notFound, rateLimit, httpsRedirect
│   │   ├── validators/         # zod schemas per resource
│   │   ├── utils/              # ApiError, asyncHandler, jwt, pagination
│   │   ├── seed/seed.ts        # realistic seed matching the reference design
│   │   ├── app.ts / server.ts
│   │   └── tests/              # vitest integration tests (incl. concurrency race)
│   ├── uploads/                # gitignored, runtime uploads
│   └── .env.example
├── mobile/
│   ├── app/                    # expo-router: _layout, (tabs)/, competition/[id], login
│   ├── src/
│   │   ├── api/                # fetch client (auth header, error normalization), endpoints
│   │   ├── hooks/              # useAuth, useCompetition(queries)
│   │   ├── theme/              # design tokens (colors, type, spacing, radius)
│   │   ├── i18n/               # ENG/हिंदी label dictionaries
│   │   └── components/         # competition/* sections + common/* primitives
│   ├── .env.example
│   └── app.json
├── .env.example                # documents both apps' variables (names only)
├── .gitignore                  # comprehensive (secrets, builds, deps, uploads…)
└── README.md
```

## 3. Data flow — register for a competition (the critical path)

```
UI tap "Register"
  → POST /competitions/:id/register (JWT)
    → zod validate (no client-computable fields accepted)
    → registrationService.registerForCompetition(user, competition)
        1. load competition, guard: published && state==registration_open
        2. INSERT registration {status: confirmed(mock)|pending_payment(razorpay)}
           ↳ unique index {competitionId, userId} + partial filter status∈{confirmed,pending_payment}
           ↳ duplicate key ⇒ 409 ALREADY_REGISTERED (race-safe)
        3. findOneAndUpdate({_id, registeredCount:{$lt:capacity}}, {$inc:{registeredCount:1}})
           ↳ null ⇒ capacity race lost ⇒ delete registration ⇒ 409 COMPETITION_FULL
        4. (razorpay mode) create order; webhook later flips status→confirmed
  → 201 { registration, competition:{registeredCount,capacity} }
  → client invalidates query; progress bar/countdown/CTA re-render from server truth
```

**Cancellation** mirrors it: window guard → `findOneAndUpdate({_id,userId,status:confirmed},{status:'cancelled'})` (idempotent) → `$inc registeredCount:-1` only on transition success. Spot conserved under any interleaving.

## 4. Component hierarchy (details screen)

```
CompetitionDetailsScreen
├── DetailsHeader (back, language pills)
├── ScrollView
│   ├── HeroCard (title, RegisteredBadge, chips, PrizeStats, SpotsProgress)
│   ├── JudgeCard (avatar, meta, intro video button)
│   ├── CountdownBanner (live ticking, per state)
│   ├── ImportantDatesCard (2×2 grid)
│   ├── WinnersStrip (horizontal, empty state)
│   ├── InfoTabs (About | Judging | Rules, View more)
│   ├── RewardsCard (all positions)
│   ├── DisclaimerBanner
│   ├── PaymentsCard (prize money / refund / Razorpay)
│   ├── ReferEarnCard (copy link, earnings)
│   ├── TestimonialsCard (empty state)
│   └── AdSlot (dashed placeholder)
├── StickyCtaFooter (Register / Upload Submission / state-specific CTA)
└── (tab bar from root layout)
```

## 5. Third-party service boundaries

| Service | Boundary | Failure mode |
|---|---|---|
| MongoDB | via Mongoose; indexes own invariants | boot aborts (or memory fallback in dev) |
| Razorpay | order create + webhook verify only; no client SDK | `PAYMENT_MODE=mock` default |
| Remote media (avatars/winner photos, intro video) | URLs from seed; UI has initial-fallback | graceful placeholder |
| Font loading | @expo-google-fonts/poppins at boot | falls back to system font |
