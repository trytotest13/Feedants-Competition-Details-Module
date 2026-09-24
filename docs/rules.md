# Rules — Coding Standards

## TypeScript
- **Strict mode always** (`strict: true`, `noUncheckedIndexedAccess`). No `any` — if unavoidable, justify in a comment.
- Shared types live in `types.ts`/`theme`; API responses typed end-to-end (backend model → controller → client).
- Prefer `satisfies` for token/config objects; `readonly` for data that shouldn't mutate.

## Naming
- Files: `PascalCase.tsx` for components, `camelCase.ts` for modules, `*.test.ts` colocated tests.
- Functions/variables camelCase; components/types/types PascalCase; constants SCREAMING_SNAKE; booleans read as predicates (`canRegister`, `isRegistered`).
- Routes plural (`/competitions`), actions singular verbs.

## Error handling (explicit, every layer)
- Backend: services throw `ApiError(status, code, message)`; one error middleware formats `{success:false,error:{code,message}}`; async handlers wrapped in `asyncHandler`; unknown → 500 without stack leak.
- Client: react-query loading/empty/error states are **mandatory** for every fetch; user-facing messages actionable ("Couldn't load. Check your connection — Retry"), never raw stack traces.
- Handle empty collections (no winners/testimonials) and edge times (countdown ≤ 0) explicitly.

## Security invariants (non-negotiable)
- Never hardcode secrets; only `.env` (gitignored) + zod-validated config. Only `.env.example` commits — placeholders, never real values.
- All input validated (zod) at the boundary; server-computed fields never accepted from clients.
- Passwords bcrypt-hashed; tokens in SecureStore; responses trimmed (no hashes/`__v`); ownership checked in every scoped query; uploads mime+size restricted; sanitize user content.
- Before any commit: scan staged files for accidental secrets; if one slips in, rotate immediately (history removal is not enough).

## Import order
1) node built-ins 2) packages 3) absolute/alias 4) relative `../` 5) relative `./`. Blank-line separated. No unused imports (lint-clean).

## Banned patterns
- Hardcoded colors/spacing outside `theme/tokens` · business logic in controllers (goes to services) · `date.now` drift-prone countdowns without server anchor · non-null `!` assertions · mutating props/state directly · `console.log` in shipped client code (logger only) · speculative abstraction for single-use code (karpathy rule: smallest correct change, verify, stop).

## Formatting
- 2-space indent, double quotes backend / single quotes mobile (per template defaults), trailing commas, max line ~110 chars.
- Comments only for constraints the code can't express (e.g., why an index is partial), never narration.

## Workflow rules
- Docs are the source of truth; change docs first (with stated trade-off) if reality must diverge.
- Update `docs/todo.md` after every completed task.
- Every phase ends with: tests/typecheck green + `git status` shows no secrets/env files.
