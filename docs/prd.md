# PRD — Feedants Competition Details Module

**Company:** Feedants · **Role:** Full Stack Development Intern (Technical Assignment)
**Scope:** The **Competition Details screen** built as a functional full-stack feature — not a static UI reproduction.
**Reference design:** [`docs/assignment/Objective_Page.png`](./assignment/Objective_Page.png)

## 1. Problem statement

Feedants runs online talent competitions. Today, competition pages are assumed to be hardcoded, which means every campaign requires a new app release and states such as "spots left", "registration closes in…", or "Registered" cannot be trusted. The Competition Details screen must render **dynamic, server-authoritative data** and behave like a real production page: registration, capacity, lifecycle, submissions, referrals and results all driven by backend/business rules.

## 2. Target audience

- **Participant (primary persona):** discovers a competition, judges trust (judge profile, prize pool, dates, rewards, previous winners), registers, pays entry fee, uploads a submission before the deadline, tracks results.
- **Recurring user:** refers friends (Refer & Earn ₹10/signup), re-enters future editions, browses previous winners and testimonials.
- **Feedants ops (secondary):** creates/curates competitions from data (seed/admin), never by shipping app updates.

## 3. Functional requirements

| ID | Requirement |
|----|-------------|
| FR-1 | Competition details (title, category chips, prize pool, entry fee, judge card, dates, rewards, tabs content, disclaimer, previous winners, testimonials, ad slot) are fetched from the API — nothing hardcoded in the client. |
| FR-2 | Server computes a single **lifecycle state** per request: `upcoming → registration_open → registration_full → awaiting_submission → submission_open → judging → completed` (+ `cancelled`). Client renders per state. |
| FR-3 | Remaining spots: server-enforced capacity with **atomic booking**; progress bar (booked/capacity) and "Only N spots left" always reflect consistent data under concurrent users. |
| FR-4 | Live countdown to `registrationCloseAt`, computed from server timestamps (client ticks locally, re-syncs on focus). |
| FR-5 | Auth: email+password register/login (JWT). Referral code can be applied **at signup**; referrer earns ₹10 per successful signup (ledgered). |
| FR-6 | Register for competition: allowed only while `registration_open`, not already registered, capacity available; entry fee payment (mock mode by default, Razorpay order flow scaffolded). Double-registration and overbooking are impossible. |
| FR-7 | Cancel registration (frees the spot) allowed only before submission starts; spot release is atomic and re-registration is allowed. |
| FR-8 | Upload submission: only confirmed (paid) registrations, only inside the submission window, validated media (type/size), one submission per user per competition, replaceable while window is open. |
| FR-9 | Important dates grid, rewards list (all positions), judging parameters, rules & eligibility, "View more" expansion — all server data. |
| FR-10 | Referral card: share link `https://feedants.com/r/<code>`, copy to clipboard, earnings shown ("You earn ₹10 for every signup"). |
| FR-11 | Testimonials ("Hear From Our Users") served from API. |
| FR-12 | UI language toggle ENG / हिंदी for interface labels. |
| FR-13 | Explicit UI states: loading, error+retry, empty (no winners/testimonials/ad), registered badge, full/sold-out, window-closed CTA states. |

## 4. Non-functional requirements

- **Concurrency correctness:** thousands of concurrent users must not overbook capacity or create duplicate registrations (atomic conditional updates + unique indexes; tested with parallel requests).
- **Security:** see [`SECURITY.md`](../SECURITY.md) (hashing, JWT, rate limits, validation, sanitization, headers, upload restrictions, field-tamper-proof server-computed values, trimmed responses, HTTPS enforcement in production).
- **Performance:** indexed queries, denormalized spot counter, pagination on lists, single aggregated detail endpoint.
- **Maintainability:** TypeScript strict, layered architecture (routes → validators → controllers → services → models), shared design tokens.
- **Portability:** runs with zero setup in dev via in-memory MongoDB fallback; Atlas/local/Docker via `MONGODB_URI`.

## 5. Out of scope

- Real payment capture/UI SDK (Razorpay checkout in-app), KYC, refunds execution — order flow + webhook contract scaffolded only.
- Judge/admin dashboard, push notifications, in-app video player streaming infra (intro video uses a sample URL), results/judging engine, multi-edition management UI, localization of server content (UI labels only), social login, messaging.
