# Implementation Plan (Phased)

## Phase 1 — Project setup & tooling ✅ acceptance-gated

| Task | Acceptance criteria |
|---|---|
| 1.1 Init dedicated git repo inside project root (outer home-dir repo untouched) | `git rev-parse --show-toplevel` = project root |
| 1.2 Write comprehensive `.gitignore` (secrets, env, deps, builds, uploads, logs, OS, editor) | `git status` shows no `node_modules`, `.env`, uploads |
| 1.3 Write `.env.example` files (root + backend + mobile) with **names only** | No real keys anywhere in repo |
| 1.4 Scaffold `backend/` (TS config, deps, folder layout) | `npm install` clean; `tsc --noEmit` passes |
| 1.5 Scaffold `mobile/` (Expo SDK 54 + expo-router + tokens) | `npm install` clean; `tsc --noEmit` passes |

## Phase 2 — Database, auth & API layer

| Task | Acceptance criteria |
|---|---|
| 2.1 Mongoose models + indexes per schema.md | Unique partial index on registrations exists |
| 2.2 Env config (zod), DB connect w/ memory fallback, error middleware, 404, rate limits, helmet, CORS, sanitize, HTTPS redirect | Boot clean; headers present; errors return `{success:false,error}` |
| 2.3 Auth: register (referral hook), login, me; bcrypt; JWT | Tests: register→login→me; wrong password 401; duplicate email 409; referral credited |
| 2.4 Competitions: list + aggregated detail with computed lifecycle view model | Detail returns state/flags/spots/countdown consistent with seeded dates |
| 2.5 Registration service: atomic book/cancel + payment modes | **Race test:** 25 parallel users, capacity 20 → exactly 20 confirmed, 5 × 409; duplicate register → 409; cancel frees spot |
| 2.6 Submissions: multipart upload, window/paid guards, replace semantics | Outside window → 422; unregistered → 403; second upload replaces |
| 2.7 Seed script (`npm run seed`) | Design-matching data present; API returns it |

## Phase 3 — Core feature: Competition Details screen

| Task | Acceptance criteria |
|---|---|
| 3.1 API client + auth context (SecureStore) + queries | 401 → logout; focus re-fetch |
| 3.2 Design tokens + primitives (Card, Chip, Badge, Skeleton, ErrorState, EmptyState, Avatar) | Match design.md tokens |
| 3.3 Screen sections in reference order (hero, judge, countdown, dates, winners, tabs, rewards, disclaimer, payments, refer, testimonials, ad) | Visual parity vs `Objective_Page.png` |
| 3.4 Lifecycle-driven CTAs (Register / Registered / Upload Submission / window-closed / full / completed) | Each state renders correct CTA + message |
| 3.5 Live countdown (server-anchored, 1s tick, re-sync on focus) | No drift beyond fetch; zero/negative handled |
| 3.6 Tab bar (Home/Explore/+/Competitions/Profile) + Home list + Profile (referral, logout) + Login (demo prefilled) | Navigate login → list → details end-to-end |
| 3.7 ENG/हिंदी toggle | Labels switch instantly |

## Phase 4 — Polish, verification & deployment

| Task | Acceptance criteria |
|---|---|
| 4.1 Backend vitest suite green (auth, detail, concurrency, submission, referral) | `npm test` exit 0 |
| 4.2 Mobile typecheck + web export; screenshot vs reference; fix diffs | Visual gate pass |
| 4.3 README: run instructions (backend+mobile), env table, API summary, assumptions/decisions/trade-offs/improvements | Meets submission requirements |
| 4.4 SECURITY.md checklist mapped to implementation | All 21 checklist items addressed |
| 4.5 Final git commit; verify no secrets tracked (`git status`, staged-file scan) | Clean history, no `.env` |
