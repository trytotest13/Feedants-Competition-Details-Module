# SECURITY — Pre-Deploy Checklist (mapped to implementation)

Source: internal pre-GitHub deploy checklist. Every item below is implemented or explicitly documented.

| # | Checklist item | How it is addressed |
|---|---|---|
| 1 | Hide API keys | All secrets in `.env` (gitignored); `.env.example` placeholders only; zod-validated config at boot (`src/config/env.ts`). |
| 2 | Purge git secrets | Dedicated repo starts clean; pre-commit scan of staged files; `gitleaks`-compatible patterns documented; no `.env`, `*.pem`, `*.key` ever tracked (enforced by `.gitignore`). |
| 3 | No public database credentials | `MONGODB_URI` never committed; Atlas creds via env; dev fallback is an isolated in-memory DB (no shared/public key). |
| 4 | "RLS" (row-level access) | MongoDB equivalent: every scoped query filters by JWT `userId` (registrations, submissions); admin-only mutations behind `requireRole('admin')`. Verified in tests. |
| 5 | Encrypt sensitive data | Passwords bcrypt (cost 12) — irreversible; JWT HS256; TLS in transit (production HTTPS, HSTS). At-rest encryption delegated to managed MongoDB (AES-256). |
| 6 | Enforce server-side auth | `requireAuth` middleware on all protected routes; no client-trusted identity; lifecycle/business rules computed **server-side only**. |
| 7 | Lock record access | Ownership checks in every read/write of registrations & submissions; 404 (not 403) for foreign records to avoid enumeration. |
| 8 | Block field tampering | Zod schemas whitelist fields; server-computed values (`registeredCount`, `status`, state, spots, earnings) are never accepted from request bodies. |
| 9 | Secure session cookies | API is stateless JWT (no cookies); token stored in device **SecureStore** (Keychain/Keystore), 7d expiry, transported only over HTTPS; refresh-token rotation listed as production improvement. |
| 10 | Hash passwords | bcryptjs cost 12 at registration; compare timing-safe on login; hash never returned (`toJSON` transform strips it). |
| 11 | Rate limit login | `express-rate-limit`: auth routes 10 req/15 min/IP; global 300/15 min; 429 with `Retry-After`. |
| 12 | Add bot protection | Rate limits + registration validation + generic error messages (no enumeration); slot for CAPTCHA/Turnstile documented as production next step. |
| 13 | Parameterize queries | 100% Mongoose typed queries (no string concatenation) + `express-mongo-sanitize` strips `$`/`.` operator injection. |
| 14 | Validate all input | Zod schemas for every body/query/param at route boundary; multipart mime+size validated; invalid → 400 with field details. |
| 15 | Escape user content | Text rendered via RN `<Text>` (no HTML injection surface); backend trims/length-caps inputs; no `dangerouslySetInnerHTML`-equivalent anywhere. |
| 16 | Restrict field uploads | Only `.jpg/.png/.webp` images & `.mp4/.mov` video; per-file size cap (`MAX_UPLOAD_MB`, default 50); random UUID filenames; uploads served from a dedicated non-executable static dir (S3 + signed URLs in production). |
| 17 | Trim API responses | Explicit `toJSON` transforms (drop `passwordHash`, `__v`); aggregated detail endpoint returns only screen-relevant fields. |
| 18 | Add security headers | `helmet` (CSP for uploads static, X-Content-Type-Options, frameguard, HSTS behind TLS, etc.); JSON bodies capped at 1MB. |
| 19 | Force HTTPS | Production: `X-Forwarded-Proto` check → 301 to HTTPS + `trust proxy`; mobile client rejects non-HTTPS API base URL outside dev. |
| 20 | Scan dependencies | Lockfile committed; `npm audit --omit=dev` gate documented for CI; pinned compatible versions across backend/mobile. |

**Additional invariants** (beyond checklist): capacity guarded by atomic conditional `$inc` + unique partial index (no overbooking), payment webhook signature-verified + idempotent, rate limits return 429 (never silent), error responses leak no stack traces in production, CORS origin allow-list via env (dev `*` only).
