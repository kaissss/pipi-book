# PiPiBook Dev Diary

---

## 2026-06-15 — Day 1: MVP Scaffold Complete

### What was built

Full MVP scaffold generated in one session using 3 parallel agents.

**Backend — 76 files (NestJS modular monolith)**

- `prisma/schema.prisma` — 7 MVP tables: users, coaches, services, available_slots, bookings, payments, notifications + RefreshToken
- Auth module — LINE OAuth code exchange → JWT (15min access) + refresh token (7d, stored in DB)
- Coach module — profile CRUD, approval gating
- Service module — coach offerings management
- Availability module — slot creation/management
- Booking module — create/cancel/confirm with Redis `SET NX EX 300` atomic lock (Lua script release) + Prisma transaction to prevent double booking
- Payment module — ECPay SHA256 CheckMacValue sign/verify, webhook handler returning `1|OK`
- Notification module — LINE push messages (Chinese templates), BullMQ jobs with 24h/1h reminder delays, 3 retries with exponential backoff
- Admin module — platform stats via 19 parallel Prisma aggregates
- Common layer — custom exceptions, JWT guard, RBAC guard, transform interceptor, logging interceptor

**Frontend — 71 files (Next.js 15 App Router)**

- Pages: Home, /coaches list, /coaches/[id] profile, 3-step booking flow (service → slot calendar → confirm+ECPay redirect), LINE auth callback, member dashboard, coach dashboard, admin dashboard
- Components: Navbar, Sidebar, BookingCalendar (FullCalendar), ServiceSelector, PaymentForm, StatsCard, shadcn/ui base components
- Hooks: useAuth, useCoach, useBooking, usePayment, useAvailability, useAdmin (all TanStack Query)
- Services: axios client with silent auto-refresh interceptor, 6 API service modules
- Middleware: SSR route protection with role-based redirects

**Infrastructure — 14 files**

- docker-compose.yml (dev: Postgres 16 + Redis 7 + hot reload)
- docker-compose.prod.yml (prod: no local DB/Redis, uses Supabase + Upstash)
- Multi-stage Dockerfiles for backend and frontend (non-root user, dumb-init)
- nginx/nginx.conf — reverse proxy, rate limiting, gzip, security headers
- .github/workflows/ci.yml — lint → test → docker build → ssh deploy
- docs/ARCHITECTURE.md, DATABASE.md, DEPLOYMENT.md, README.md

### Product rename

- `CoachBook` → `PiPiBook` across all 28 affected files

### Next actions

- [ ] Fill in `.env` credentials (LINE Console, ECPay, Supabase, Upstash)
- [ ] `docker-compose up` → verify dev stack boots
- [ ] `npx prisma migrate dev --name init` → create DB tables
- [ ] LINE Login end-to-end test
- [ ] Booking flow end-to-end test
- [ ] Deploy to Railway (backend) + Vercel (frontend)

---

## 2026-06-15 — Day 1 (continued): Frontend Dev Server Running

### Goal
Get the Next.js frontend running locally for UI testing.

### Issues found & fixed

| Issue | Fix |
|---|---|
| `@radix-ui/react-badge` doesn't exist as a real package | Removed from `frontend/package.json` |
| `autoprefixer` missing (required by Tailwind/PostCSS) | Installed as dev dependency |
| Next.js 15.0.3 had a critical CVE (CVE-2025-66478) | Upgraded to 16.2.9 via `npm install next@latest` |
| `middleware.ts` deprecated in Next.js 16 | Renamed to `proxy.ts`, updated export to `proxy()` |
| `experimental.serverActions` deprecated in Next.js 16 | Removed from `next.config.ts` (now stable) |
| No `.env.local` for local dev | Created with dummy values so app boots without real credentials |

### Result

Frontend dev server running at **http://localhost:3000** — homepage HTTP 200, all public routes accessible, protected routes (`/member`, `/coach`, `/admin`) correctly redirect to `/auth/login`.

### Still pending

- [ ] Fill real credentials in `frontend/.env.local` (LINE LIFF ID, LINE Channel ID)
- [x] Start backend server ← done, see below
- [ ] Run `prisma migrate dev` to create DB tables
- [ ] Full LINE Login → booking flow end-to-end test

---

## 2026-06-15 — Day 1 (continued): Backend Dev Server Running

### Goal
Run NestJS backend locally with `npm run start:dev`.

### Issues found & fixed

| File | Error | Fix |
|---|---|---|
| `src/app.config.ts` | `parseInt(process.env.SLOT_LOCK_TTL_SECONDS)` — `undefined` not assignable to `string` | Added `?? '300'` fallback |
| `src/modules/auth/auth.service.ts` | Prisma `user.lineUserId / email / displayName / avatar` are `string \| null`, DTO expects `string` / `string \| undefined` | Added `?? ''` on `lineUserId`, `?? undefined` on nullable fields |
| `src/modules/auth/line-auth.service.ts` | `URLSearchParams` received `string \| undefined` from `configService.get()` | Added `?? ''` fallbacks on `channelId`, `channelSecret`, `defaultRedirectUri` |
| `src/modules/booking/booking.redis-lock.service.ts` | `new Redis(redisUrl)` — `redisUrl` is `string \| undefined` | Added `?? ''` fallback |
| `src/modules/notification/line-messaging.service.ts` | `configService.get()` return used directly as `string` | Added `?? ''` fallback |
| `src/modules/payment/ecpay.service.ts` | 4 private getters returning `configService.get()` directly + `ReturnURL` possibly undefined | Added `?? ''` on all getters and `ReturnURL` |
| `src/modules/payment/payment.service.ts` | `returnURL: dto.returnUrl` — `dto.returnUrl` possibly undefined | Added `?? ''` fallback |

Total: 14 TypeScript errors → 0.

### Result

Backend running at **http://localhost:4000** [development]
- Redis connected for slot locking
- Prisma connected to database (Supabase)
- All routes mapped under `/api/v1`
- Swagger docs at **http://localhost:4000/api/docs**

### Run command
```bash
cd backend
npm run start:dev
```

---

## 2026-06-17 — Day 2: Railway Backend Deployed ✅

### Goal
Deploy NestJS backend to Railway via Docker.

### Issues encountered & fixed

| Issue | Fix |
|---|---|
| `npm ci` failed — no `package-lock.json` in `backend/` | Root uses npm workspaces; lock file lives at root. Rewrote Dockerfile to use `npm install` with `backend/` as standalone build context |
| `Cannot find module '.prisma/client/default'` | `prisma generate` ran in builder stage but prod stage copied `node_modules` from prod-deps (no generate). Fixed by copying `node_modules/.prisma` from builder into production stage |
| Prisma native engine crash | Missing `binaryTargets` in schema. Added `linux-musl-openssl-3.0.x` for Alpine Linux |
| Docker vs Nixpacks confusion | Removed Nixpacks (`nixpacks.toml`). Railway now uses `backend/railway.json` with `"builder": "DOCKERFILE"` |
| `prisma migrate deploy` not available in prod container | Moved `prisma` CLI from devDependencies → dependencies so it's available at runtime |

### Supabase + Railway IPv4 gotcha ⚠️

Railway only supports **IPv4**. Supabase's direct connection URL uses **IPv6** by default.

**Fix:** Use the **Transaction Pooler** domain for **both** `DATABASE_URL` and `DIRECT_URL`.

```env
# Both point to the pooler (port 6543 and 5432 variants both use IPv4)
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

Do NOT use `db.[ref].supabase.co` — that resolves to IPv6 and Railway will fail to connect.

### Final working setup

- **Railway Root Directory**: `backend`
- **Builder**: Dockerfile
- **Health check**: `/health` → 200 ✅
- **DB**: Supabase (pooler domain for both URLs)
- **Redis**: Upstash
- **Migrations**: run automatically on container start via `npx prisma migrate deploy`

---

## 2026-06-17 — Day 2 (continued): Vercel Frontend Build Fixed

### Goal
Fix frontend production build errors caught by `npm run build` / Vercel CI.

### Issues found & fixed

| File | Error | Fix |
|---|---|---|
| `src/components/booking/BookingCalendar.tsx` | `eventCursor` is not a valid FullCalendar prop — TypeScript build error | Removed prop; pointer cursor was already handled by `.fc .fc-event { cursor: pointer }` in `globals.css` |
| `src/app/auth/login/page.tsx` | `useSearchParams()` not wrapped in `<Suspense>` — prerender error | Extracted content into `LoginContent` component, wrapped in `<Suspense>` in default export |
| `src/app/auth/callback/page.tsx` | `useSearchParams()` not wrapped in `<Suspense>` — prerender error | Extracted content into `AuthCallbackContent` component, wrapped in `<Suspense>` in default export |

### Root cause

These bugs only surfaced on Vercel because:
- `eventCursor` — TypeScript type-checking only runs during `next build`, not `next dev`
- `useSearchParams` — Next.js static prerendering only runs during `next build`, not `next dev`

### Lesson

Always run `npm run build` locally before pushing to catch build-time errors that `npm run dev` silently ignores.

### Result

Frontend successfully deployed to Vercel ✅

---

## 2026-06-19 — Day 4: Code Review of Railway-Deploy Refactor

### Goal
Review the backend redesign for Railway deploy + local dev (commits `50a0d34`..`6f16342`) and remove unnecessary changes.

### Issues found & fixed

| Severity | File | Issue | Fix |
|---|---|---|---|
| 🔴 High | `backend/src/main.ts` | CORS dropped the `nodeEnv` check — with `CORS_ORIGINS` empty, `origin` fell back to `true`, reflecting **any** origin with `credentials: true` (CWE-942) | Fail closed in production: `origin: false` when the allowlist is empty |
| 🟠 Med | `backend/src/app.config.ts` | `enableSwagger` defaulted to `true`, publishing `/api/docs` in production by default | Off in prod unless `ENABLE_SWAGGER=true`; on otherwise |
| 🟠 Med | `backend/prisma/schema.prisma` | Comment claimed `directUrl` falls back to `DATABASE_URL` when unset — it does not; `prisma migrate deploy` (run on every Docker deploy) would fail | Corrected comment; `DIRECT_URL` must be set (mirror `DATABASE_URL` for local) |
| 🟡 Low | `backend/src/app.module.ts` | BullMQ comment ("fail fast on a bad command") didn't match the code (job retention) | Rewrote comment to describe job trimming |
| 🟡 Low | `frontend/src/app/auth/login/page.tsx` | No-op SVG edit (`.63`→`.630`, numerically identical) — pure diff noise | Reverted |
| 🟡 Low | `backend/package.json` | Dead `railway:start` script — Railway uses the Dockerfile `CMD`, nothing references it | Removed |

### Action items (config, not code)

- [ ] Set `CORS_ORIGINS` (frontend URL) in Railway — with the CORS fix, a missing value now **blocks** the frontend in prod instead of silently allowing all origins.
- [ ] Confirm `DIRECT_URL` is set in Railway (already covered by the pooler setup from Day 2).

### Result

Backend type-checks clean (`tsc --noEmit` → 0 errors). Changes left in the working tree for review.

---

## 2026-06-19 — Day 4 (continued): LINE Login End-to-End Fixed

### Goal
Fix LINE OAuth login flow on production (Vercel frontend + Railway backend).

### Issues found & fixed (in order of discovery)

| Issue | Symptom | Fix |
|---|---|---|
| `CORS_ORIGINS` not set in Railway | Every API call failed CORS in prod after we hardened CORS to fail-closed | Set `CORS_ORIGINS=https://pipi-book-frontend.vercel.app` in Railway Variables |
| `/auth/callback` cached by Vercel CDN | Cache age 21m — LINE one-time codes were being served against a stale HTML shell | Added `export const dynamic = "force-dynamic"` to callback page |
| State mismatch in LINE IAB | LINE IAB opens OAuth in a new webview layer; `localStorage` state from the login page wasn't accessible in the callback webview → hard-blocked with "CSRF attack" error | Downgraded to `console.warn` — one-time-use `code` is sufficient replay protection |
| `LINE_REDIRECT_URI` mismatch | Backend used `localhost` URI in Railway; LINE rejected the code exchange (`redirect_uri is not matched`) | Updated Railway `LINE_REDIRECT_URI` to match Vercel frontend URL |
| API response envelope not unwrapped | Backend wraps all responses in `{ success, data, timestamp }`; frontend read `response.data.tokens` / `response.data.user` which were both `undefined` → `setTokens(undefined)` threw → mutation failed → "Login Failed" screen | Added axios response interceptor in `api-client.ts` to unwrap the envelope automatically |
| `AuthResponse` shape mismatch | Frontend type expected `{ user, tokens: { accessToken, refreshToken } }`; backend sends `{ accessToken, refreshToken, expiresIn, user }` flat | Flattened `AuthResponse`; updated `useLineCallback.onSuccess` to build `AuthTokens` from flat fields |
| `User` field name mismatches | `pictureUrl` → `avatar`, `lineId` → `lineUserId`, `isActive` → `status === "ACTIVE"` across 8 components | Updated `User` type + all call sites |

### Root cause

The frontend types and service layer were written before the backend was running — the assumed response shapes never matched the actual backend output. The envelope mismatch (`{ success, data }` wrapper) was the critical blocker; the field renames were secondary but would have broken avatars and active-state badges throughout the UI.

### Lesson

Run `tsc --noEmit` against real API response shapes (not assumed ones) before integrating. A one-time type alignment pass against the live `/api/docs` Swagger would have caught all of these at once.

### Result

LINE login flow works end-to-end in production. User lands on `/member/dashboard` after auth.

---

## 2026-06-19 — Day 4 (continued): Fix Post-Login Redirect Loop

### Issue

After a successful login, `router.push("/member/dashboard")` triggered the Edge middleware, which read `cb_access_token` from cookies, found nothing, and redirected back to `/auth/login?redirect=%2Fmember%2Fdashboard`.

### Root cause

`setTokens()` wrote the access token to `localStorage` only. The Edge middleware (`proxy.ts`) reads from cookies — it cannot access `localStorage` (runs server-side before the page renders). The cookie was never set, so the middleware always treated the user as unauthenticated.

Both halves were written independently and assumed different storage mechanisms.

### Fix

`setTokens()` now mirrors the access token into `cb_access_token` cookie (`SameSite=Lax`, `max-age` = token TTL) alongside `localStorage`. `clearTokens()` expires the cookie in the same call.

```ts
document.cookie = `cb_access_token=${tokens.accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
```

### Result

Post-login redirect to `/member/dashboard` succeeds. Middleware reads the cookie, verifies the JWT payload (role + expiry), and allows the navigation.


---

## 2026-06-27 — Day 5: "Become a Coach" + API Contract Reconciliation

### Part 1 — Students couldn't become coaches

**Symptom:** Logged-in student clicks "as coach" → never reaches the coach portal.

**Root cause:** `POST /coaches` created a `Coach` row but never promoted `user.role` from `STUDENT` to `COACH`. Every access gate (Edge middleware `proxy.ts`, `useAuth().isCoach`) keys off the role, so a student was permanently locked out. There was also no onboarding UI — "Start as Coach" just linked to `/auth/login`.

**Fix:**
- `coach.repository.createWithRolePromotion()` — creates the profile AND promotes the user to `COACH` in one `$transaction` (no half-applied state).
- New `/member/become-coach` onboarding form (lives under `/member` so the middleware lets a student in).
- `useCreateCoachProfile` refreshes the access token after creation (the cookie JWT still said `STUDENT` until re-issued — otherwise middleware bounces the request back), refetches `/auth/me`, then routes to `/coach/dashboard`.
- Fixed a latent bug: `setTokens()` was overwriting the refresh token with `undefined` on access-only refreshes (also affected the auto-refresh interceptor).
- Wired entry points: home, footer, and a Navbar item for students.

### Part 2 — The contract drift was systemic (whole API)

Investigating the coach-profile field mismatch revealed the entire frontend was built against an *imagined* API: `Coach`, `Service`, `Booking`, `Payment`, and the whole admin surface diverged from the backend. The booking list pages were **already broken at runtime** (`BookingCard` reads `booking.coach.user`, `booking.student`, `booking.service.name`, `booking.payment` — none of which the backend returned).

**Decision:** Extend the backend to match the frontend types (Phase A + B), done verifiably.

**Done (compiles clean, both apps):**
- **Coach** — `bio, specialties[], experience(int), status, timezone, location, languages, certifications, coverImageUrl, services[]` + `rating`/`reviewCount` placeholders. `isApproved` Boolean → `status` `CoachStatus` enum.
- **Service** — `title`→`name`, `duration`→`durationMinutes`, added `type`/`currency`/`maxParticipants`.
- **Booking response** — reshaped to the client contract: `student`, `coach.user`, full `service`, ISO `slot.startTime`, `payment`, `status`, `notes`, `meetingUrl`. Added `/bookings/:id/complete` and `/bookings/:id/meeting`.
- **Admin (Phase B)** — `GET /admin/coaches?status`, approve/reject/suspend, `users/:id/suspend|activate`, `GET /admin/bookings/recent`, flat `PlatformStats`. `UserStatus` `BANNED`→`SUSPENDED`.
- Coach `PUT /coaches/me` → `PATCH` to match the frontend.
- Migration `20260627120000_extend_coach_service_booking` (preserves `is_approved`→`status`; renames service columns; drops `nickname`/`introduction`/`hourly_price`, retypes `experience`).

**Still mismatched (deferred — booking-creation/scheduling flows):** path differences only —
- Coach services CRUD: frontend `/coaches/me/services` vs backend `/services`.
- Availability/slots: frontend `/coaches/me/slots`, `/coaches/:id/availability` vs backend `/availability/*` (booking calendar won't load slots).
- Payment init: not yet verified against `usePayment`.

### Root cause / lesson

Same as the LINE-login saga: frontend types hand-written speculatively with no shared contract. The durable fix is to generate the frontend API types from the backend's NestJS Swagger/OpenAPI so the two can't drift. Until then, every integration needs a type-alignment pass against the live API.

### Migration note

Apply before restarting the backend: `cd backend && npx prisma migrate deploy`. Railway applies it on deploy automatically.

---

## 2026-06-27 — Day 5 (continued): Align coach services + availability endpoints

### Goal
Complete the deferred path/shape mismatches so the coach-services CRUD and the booking/scheduling calendars work end-to-end.

### Coach services CRUD
Frontend called `/coaches/me/services` etc.; backend served `/services`. Re-routed
`ServiceController` under `@Controller('coaches')`:
- `GET :coachId/services`, `POST me/services`, `PATCH me/services/:serviceId`, `DELETE me/services/:serviceId`
- Dropped the unused standalone `GET /services/:id` (would have collided with `GET /coaches/:id`).

### Availability / slots
Frontend (FullCalendar) is built on **ISO start/end datetimes**; backend stored `date` + `time`
separately (timezone-ambiguous). Fixed the model rather than band-aid the boundary:
- `AvailableSlot` now stores `startTime`/`endTime` as full `DateTime` (dropped `date`).
- `AvailabilityController` re-routed under `/coaches/*`: `GET :coachId/availability`,
  `GET me/slots`, `POST me/slots`, `POST me/slots/bulk`, `DELETE me/slots/:id` (all with `from`/`to` window).
- Slot create accepts ISO; responses return ISO + status mapped OPEN→AVAILABLE / LOCKED→BLOCKED / BOOKED→BOOKED.
- `booking.service` slot mapper simplified to `startTime.toISOString()` (no more date+time compose).
- Not implemented (frontend has them but no page calls them): `/block`, availability patterns.

### Workflow finding
The Dockerfile runs `prisma migrate deploy`, but `backend/prisma/migrations/` is git-ignored and
nothing is committed — so that pipeline is effectively a no-op. Confirmed with the team the real
workflow is **`prisma db push`** (schema.prisma is the source of truth). Did NOT commit migrations
or change the ignore rule. Schema changes are applied via `npx prisma db push`.

### Apply (db push workflow)
`cd backend && npx prisma db push --accept-data-loss` — the `--accept-data-loss` flag is required
because this drops the old coach columns (nickname/introduction/hourly_price), retypes `experience`,
and drops the slot `date` column.

### Result
Both apps type-check clean. Coach can manage services and open availability; booking calendar loads
slots. (Earlier Day-5 instruction to run `migrate deploy` was wrong for this project — use `db push`.)

---

## 2026-06-27 — Day 5 (continued): Add missing GET/PATCH /auth/me

### Symptom
"Become a Coach" showed "Failed to create your coach profile" — but `POST /coaches`
returned `201` and the coaches row existed. DevTools showed the real failure:
`GET /api/v1/auth/me` → `404 Not Found`.

### Root cause
The backend auth controller never implemented `GET /auth/me` (or `PATCH /auth/me`).
The frontend has always called `authService.getMe()` / `updateProfile()` assuming they
exist. Normally the 404 is swallowed — `useAuth` falls back to the stored user from the
login response with `retry:false` — but the onboarding flow `await`s `getMe()` directly,
so the 404 turned a successful creation into a failure. Same class of bug as the rest of
the session: frontend built against endpoints that were never implemented.

### Fix (backend only, no schema change)
- Added `GET /auth/me` → returns current user in the client `User` shape.
- Added `PATCH /auth/me` → profile update (displayName/email/phone); extended
  AuthRepository.updateUser to accept phone.
- Hardened `useCreateCoachProfile`: after `POST /coaches` succeeds, the refresh + getMe
  steps are best-effort (try/catch) so a follow-up hiccup never reports a created profile
  as "failed".

### Side effect noted
This also fixes app-wide silent 404s on `/auth/me` — the logged-in user now actually
refreshes from the server instead of running off the login-time stored copy.

### Deploy
Backend code change only — redeploy (git push → Railway). No `prisma db push` needed.

---

## 2026-06-27 — Day 5 (continued): Role switcher (active-role)

Single `role` per user, but a coach is also a member who books other coaches.
Added a client-side active-role switch (not two portal links):
- `activeRole` persisted in localStorage (`cb_active_role`), clamped to
  `availableRoles`: ADMIN -> [ADMIN, COACH, STUDENT], COACH -> [COACH, STUDENT],
  STUDENT -> [STUDENT]; cleared on logout.
- Navbar renders for the ACTIVE role ("Viewing as X"; Dashboard/Profile target
  that role); a "Switch to {role}" action changes it and routes to that dashboard.
- activeRole never exceeds real privileges; single `role` still governs access.
Frontend only.

---

## 2026-06-27 — Day 5 (continued): Mobile nav fixes

- Added the missing Profile link to the mobile menu (was desktop-only).
- Sidebar was `hidden md:flex`, so portal sub-nav (Users/Coaches,
  Schedule/Services/Bookings) vanished on mobile. Sidebar now renders a
  horizontal scrollable nav on mobile (sticky under navbar) + vertical sidebar on
  desktop; layouts stack flex-col on mobile / flex-row on desktop.
Frontend only.

---

## 2026-06-27 — Day 5 (continued): Legal/info pages

`/terms`, `/privacy`, `/help` were linked (login + footer) but didn't exist (404).
Added all three as static pages with Navbar/Footer + metadata. Terms/Privacy are
MVP boilerplate pending legal review; Help is an FAQ. Frontend only.

---

## 2026-06-27 — Day 5 (continued): Payment endpoint alignment (init 404)

Frontend POSTed `/payments/init` with `{ method, returnUrl }` expecting
`{ formUrl, params }`; backend served `POST /payments` with a strict
`paymentMethod` enum and a different response → 404.
- route -> `POST /payments/init`; `InitPaymentDto { bookingId, method?, returnUrl? }`
- returns `{ tradeNo, formUrl, params }` (params include CheckMacValue)
- client `returnUrl` now maps to ECPay OrderResultURL (browser return); server
  ReturnURL webhook comes from config (was wrongly overwritten)
- frontend useInitPayment builds a hidden form and POSTs to ECPay (no single
  redirect URL exists for ECPay)
Requires ECPAY_* env (incl. ECPAY_RETURN_URL = public /payments/webhook).

---

## 2026-06-27 — Day 5 (continued): Cash payment option

Added CASH alongside the online card flow.
- `PaymentMethod` enum gains CASH; `initPayment` branches — cash records an unpaid
  CASH payment, no ECPay redirect (booking stays PENDING for coach confirmation).
- BookingConfirmation gains a Card/Cash selector (Card -> CREDIT_CARD); cash routes
  to My Bookings. Frontend PaymentMethod stays "ECPAY"|"LINE_PAY"|"CREDIT_CARD"|"CASH".
Backend redeploy + `prisma db push` (adds CASH enum). Cash lets booking complete
without ECPay creds — handy for testing.

---

## 2026-06-27 — Day 5 (continued): Retry payment after abandoning ECPay

Closing the ECPay page left a PENDING payment, so re-initiating hit the unique
`bookingId` constraint (500) and there was no retry UI.
- initPayment reuses an existing unpaid payment (refreshes ECPay trade no/params)
  instead of creating a duplicate; still blocks if already PAID.
- "Pay" action on pending unpaid card bookings in My Bookings re-runs ECPay.
Known follow-up: abandoned bookings leave the slot LOCKED; `releaseExpiredLocks`
exists but nothing schedules it — needs a cron.
Backend redeploy only; no schema change.

---

## 2026-06-27 — Day 5 (continued): Fix ECPay return/result flow

### Symptom
After paying on ECPay, the browser POST landed on the frontend
`/member/bookings` → middleware redirected to `/auth/login` → 405; then after an
env tweak, `POST /payment/result` → 404.

### Root causes
1. `initPayment` passed the frontend `returnUrl` as ECPay `OrderResultURL`, which
   ECPay POSTs to — but the SPA page is auth-gated and GET-only (405).
2. ECPay callback URLs didn't match real routes: the configured path was
   `/payment/result` (singular, no prefix) while the route was
   `/api/v1/payments/result` (404).

### Fix (backend; no schema change)
- Frontend `returnUrl` is now ECPay `ClientBackURL` (GET return-to-merchant), not
  `OrderResultURL`. `ReturnURL`/`OrderResultURL` come from config.
- Added `POST /payments/result`: handles ECPay's browser POST, finalizes as a
  best-effort fallback (reusing the webhook logic), then 303-redirects (GET) to
  `FRONTEND_URL/member/bookings`.
- Added `app.frontendUrl` config (`FRONTEND_URL`, falls back to `CORS_ORIGINS`).
- Excluded `payments/webhook` and `payments/result` from the `/api/v1` prefix so
  ECPay hits stable, unversioned paths (like `/health`). `init` stays under
  `/api/v1` (SPA-only).
- `.env.example`: documented `FRONTEND_URL`, `REDIS_TOKEN`, and the unversioned
  callback paths.

### Correct flow (ECPay AIO, doc 2864)
1. SPA `POST /api/v1/payments/init` → `{ formUrl, params }` (incl. CheckMacValue).
2. SPA auto-submits hidden form POST → ECPay AioCheckOut/V5; user pays.
3. ReturnURL (server) → `POST /payments/webhook` → verify CheckMacValue → PAID →
   confirm booking → respond `1|OK` (authoritative).
4. OrderResultURL (browser) → `POST /payments/result` → finalize fallback → 303 →
   `FRONTEND_URL/member/bookings`.
5. ClientBackURL = `FRONTEND_URL` (return-to-merchant link).

### Railway env (note plural `payments`, no `/api/v1`)
```
ECPAY_RETURN_URL=https://pipi-book-production.up.railway.app/payments/webhook
ECPAY_ORDER_RESULT_URL=https://pipi-book-production.up.railway.app/payments/result
FRONTEND_URL=https://pipi-book-frontend.vercel.app
```
Backend redeploy only.

---

## 2026-06-27 — Day 5 (continued): ECPay callback accepts raw body

### Symptom
ECPay callback → 400: `property CustomField1..4 should not exist`.

### Root cause
The global ValidationPipe runs `whitelist + forbidNonWhitelisted`, so ECPay's
extra fields (CustomField1-4, StoreID, …) were rejected. Deeper issue: those
fields are part of ECPay's CheckMacValue, so even stripping them (not 400ing)
would break signature verification. Webhooks must be verified by signature, not
schema-validated.

### Fix (backend only)
- `/payments/webhook` and `/payments/result` now take the raw body
  (`Record<string, string>`) instead of a DTO → the global pipe leaves all fields
  intact (a plain object has no validation metatype).
- `handleWebhook` verifies CheckMacValue over the exact received params.
- Removed the now-unused `EcpayWebhookDto` (confirmed orphaned via grep).
Backend redeploy only.

### Note added to CLAUDE.md
New rule: "Raise bad practice when you see it" — don't silently follow an existing
flawed pattern (e.g. versioning a webhook URL under /api/v1); flag and fix it.
Prompted by the earlier ECPay path back-and-forth.

---

## 2026-06-28 — Day 6: Re-booking a slot 500'd (slot↔booking 1:1)

### Symptom
`POST /api/v1/bookings` → 500. Railway log:
`Invalid prisma.booking.create() ... violate the required relation 'AvailableSlotToBooking'`.

### Root cause
`Booking.slotId` was `@unique` (1:1 slot↔booking), so a slot could hold only one
booking row ever. After cancelling (slot → OPEN, booking row kept) or abandoning a
payment, re-booking that slot violated the relation → 500. The `@unique` was
redundant anyway — the OPEN-status check already prevents two active bookings.

### Fix (backend)
- slot→booking is now one-to-many: drop `@unique` on `Booking.slotId`;
  `AvailableSlot.booking?` → `bookings Booking[]`.
- only one ACTIVE booking per slot, still enforced by the OPEN-status check in
  createBooking (so no double-booking).
- `findBySlotId` returns the active booking (latest non-cancelled) via `findFirst`.
- History preserved (cancelled bookings remain).

Apply with `prisma db push` (drops the slot_id unique index; no data loss).
Backend redeploy.

---

## 2026-06-30 — Day 6 (continued): Batch schedule, slot unselect, dev login

### Coach schedule — batch create
Was one-dialog-per-slot. Redesigned to draft-then-save: drag multiple time blocks
(rendered as orange "unsaved" events), click an unsaved block to remove it, Clear
discards all, and "Save N slots" commits them in one bulk call
(`/coaches/me/slots/bulk`). Added `useBulkCreateSlots`; fixed the frontend
bulkCreateSlots return type to `{ created }`.

### Booking calendar — unselect slot
Clicking the already-selected slot now deselects it (toggle); `onSlotSelect`
accepts null. (Bug: previously could only select, never clear.)

### Bug noted, partially addressed
A 1-hr service booked a whole multi-hour block because a slot = one bookable unit.
The batch redesign lets the coach create individual hourly slots (calendar snaps to
30 min). Auto-splitting a dragged block into fixed-length slots was offered as a
follow-up, not built.

### Dev login (bypass LINE locally)
LINE login doesn't work in local builds, blocking testing. Added a dev-only login:
- `POST /auth/dev/login { role }` issues JWTs for a deterministic test user
  (`dev+{role}@pipibook.local`, role STUDENT/COACH/ADMIN) with no LINE OAuth.
- Hard-gated: backend throws if `NODE_ENV=production`; login page only renders the
  role buttons when `NODE_ENV !== production`. Defense in depth (hidden in prod
  build AND rejected by the prod backend).
- Only works against a backend running in dev; the Railway backend refuses it.
No schema change, no new env.

---

## 2026-06-30 — Day 6 (continued): Dev login finally works locally (Prisma .env hijack)

### Symptom
Dev login worked via curl (200) but the browser was always CORS-blocked; editing
`backend/.env.local` (CORS_ORIGINS/NODE_ENV) had no effect no matter how many restarts.

### Root cause
Prisma auto-loads **`.env`** (only `.env`, never `.env.local`) into `process.env` at
import time — before NestJS ConfigModule runs. `dotenv` never overwrites an already-set
var, so `.env.local` could only ADD new keys (`DEV_LOGIN_ENABLED` worked) but could never
OVERRIDE keys shared with `.env` (CORS_ORIGINS, NODE_ENV). So local CORS stayed pinned to
the deployed vercel origin and blocked `localhost:3000`.

Also wasted time on: a stale `node dist/main` (start:prod) squatting on :4000, and
`nest --watch` not reloading on `.env` changes. Confirmed via a temp `[envdebug]` log that
the running process had `nodeEnv=production corsOrigins=[vercel]` despite the file merge
yielding localhost; Windows env scopes were all empty → pointed at Prisma's early load.

### Fix
`backend/scripts/dev-local.js` sets NODE_ENV/CORS_ORIGINS/FRONTEND_URL/DEV_LOGIN_ENABLED as
real env vars (which win over both Prisma's and Nest's `.env`), then runs `start:dev`.
Added `npm run start:local`. Verified: `Access-Control-Allow-Origin: http://localhost:3000`.
Use `start:local` for local dev; `.env` untouched.
