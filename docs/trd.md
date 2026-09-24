# TRD — Technical Requirements

## 1. Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Mobile | **React Native 0.81 + Expo SDK 54** (TypeScript) | Assignment requires React Native; Expo Go enables instant run on device/simulator without native builds; also exports to web for review. |
| Navigation | **expo-router ~6** (file-based) | Expo default; typed routes, tab layout, deep-linkable competition URLs. |
| Server state | **@tanstack/react-query v5** | Caching, re-fetch on focus (keeps countdown/state fresh), retry/error states out of the box. |
| Backend | **Node.js + Express 4 + TypeScript** | Assignment requirement; layered, framework-agnostic services. |
| ODM | **Mongoose 8** | Schemas, validation, unique/partial indexes needed for concurrency correctness. |
| DB | **MongoDB** (Atlas/local/Docker) | Assignment requirement. Dev fallback: `mongodb-memory-server` when `MONGODB_URI` is unset. |
| Auth | **JWT (jsonwebtoken) + bcryptjs** | Stateless tokens for horizontally scaled API; bcrypt cost 12. |
| Validation | **Zod 3** | Single source of truth for request body/query/param validation. |
| Uploads | **multer 2** (disk, dev) | Strict mime/size filter; S3/Cloudinary adapter is the documented production swap. |
| Payments | **razorpay SDK** behind `PAYMENT_MODE` | `mock` (default, auto-confirm) or `razorpay` (order creation + signature-verified webhook). |
| Tests | **Vitest 3 + supertest + mongodb-memory-server** | Integration tests for business rules incl. concurrency race tests. |
| Tooling | tsx (dev), helmet, cors, express-rate-limit, express-mongo-sanitize, morgan, compression | Security headers, observability, sane defaults. |

## 2. State management choice

- **Server state = react-query** (single source of truth is the API — matches the "never hardcode" requirement; re-fetch on app focus keeps lifecycle state/countdown honest).
- **Client state = React context only** (auth token/user, i18n locale). No Redux/Zustand — there is no complex shared mutable client state; simplicity wins.

## 3. API strategy

REST, versioned under `/api/v1`, JSON envelope `{ success, data | error }`. Server **computes** derived values (state, spotsLeft, canRegister…) — clients never send them (tamper-proof). All list endpoints paginated (`?page&limit`).

### Endpoint outline

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/register` | — | Create account (optional `referralCode`), returns JWT |
| POST | `/auth/login` | — | Email+password (rate-limited), returns JWT |
| GET | `/auth/me` | ✅ | Current profile + referral summary |
| GET | `/competitions` | optional | Paginated list with computed `state`; supports `?q=` text search (title/category/tags, regex-escaped) and `?category=` filter — powers the Explore screen |
| GET | `/competitions/:idOrSlug` | optional | **Aggregated detail**: competition + `view` (state, flags, countdown, spots) + winners + testimonials |
| POST | `/competitions/:id/register` | ✅ | Book spot (atomic) + entry-fee payment |
| DELETE | `/competitions/:id/registration` | ✅ | Cancel (frees spot, window-checked) |
| POST | `/competitions/:id/submission` | ✅ | multipart upload, window/paid-checked |
| GET | `/referrals/me` | ✅ | Code, link, count, earnings |
| POST | `/payments/webhook` | signature | Razorpay webhook (payment captured) |

### Auth setup

- Passwords hashed with bcrypt (cost 12); JWT HS256, `7d` expiry, carried in `Authorization: Bearer`.
- Token stored in `expo-secure-store` (Keychain/Keystore), never in plain storage.
- Login rate-limited (10/15 min/IP), generic error messages (no user enumeration).

## 4. Environment variables

All secrets live in `.env` (gitignored). Only `.env.example` files are committed. Root [`../.env.example`](../.env.example) documents both apps.

**backend/.env.example**
```
NODE_ENV=development
PORT=4000
MONGODB_URI=            # empty → in-memory dev fallback
JWT_SECRET=
JWT_EXPIRES_IN=7d
CORS_ORIGINS=*
PAYMENT_MODE=mock
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
UPLOAD_DIR=uploads
MAX_UPLOAD_MB=50
ALLOW_DB_FALLBACK=true
```

**mobile/.env.example**
```
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
# Android emulator: http://10.0.2.2:4000/api/v1 · iOS simulator: http://localhost:4000/api/v1
# Physical device: http://<your-lan-ip>:4000/api/v1
```

Runtime env validation: backend asserts required vars via zod at boot (`config/env.ts`); mobile asserts `EXPO_PUBLIC_API_URL` exists.
