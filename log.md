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
