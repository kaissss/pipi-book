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
