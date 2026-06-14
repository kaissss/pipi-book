# PiPiBook — System Architecture

## Overview

PiPiBook is a multi-tenant SaaS where each coach operates a branded LINE-powered booking page. Clients book sessions via LIFF (LINE Front-end Framework) without leaving the LINE app. Payments flow through ECPay (Taiwan). Coaches manage schedules through a Next.js dashboard.

---

## System Diagram (ASCII)

```
                         ┌──────────────────────────────────────────┐
                         │              Cloudflare CDN               │
                         │  (DNS, TLS, WAF, DDoS protection)         │
                         └────────────────┬─────────────────────────┘
                                          │ HTTPS
                         ┌────────────────▼─────────────────────────┐
                         │                Nginx                      │
                         │  (reverse proxy, gzip, security headers)  │
                         │  /         → frontend:3000                │
                         │  /api/*    → backend:4000                 │
                         └──────────┬───────────────┬───────────────┘
                                    │               │
               ┌────────────────────▼──┐   ┌────────▼────────────────────┐
               │    Next.js Frontend   │   │     NestJS Backend API       │
               │    (App Router)       │   │     /api/v1/*                │
               │    SSR + LIFF pages   │   │     Swagger at /api/docs     │
               └────────────────────┬─┘   └──────┬────────┬─────────────┘
                                    │             │        │
                                    │      ┌──────▼───┐  ┌▼──────────────┐
                                    │      │ Supabase │  │ Upstash Redis │
                                    │      │ Postgres │  │ (cache/queue) │
                                    │      └──────────┘  └───────────────┘
                                    │
               ┌────────────────────▼──────────────────────────────────────┐
               │                     External Services                      │
               │  LINE Platform (Login OAuth, Messaging API, LIFF)          │
               │  ECPay (payment gateway, webhook callbacks)                │
               └───────────────────────────────────────────────────────────┘
```

---

## Module Descriptions

### Frontend (`/frontend`)

Built with Next.js 14 App Router.

| Route group     | Purpose                                                     |
|-----------------|-------------------------------------------------------------|
| `app/(coach)/`  | Coach dashboard: schedule management, booking list, analytics|
| `app/(client)/` | Client-facing booking flow embedded in LIFF               |
| `app/auth/`     | LINE Login callback handler, token exchange                |
| `app/api/`      | Next.js Route Handlers (thin BFF layer if needed)          |

State management: React Server Components + SWR for client mutations.

### Backend (`/backend`)

Built with NestJS 10, follows feature-module structure.

| Module         | Responsibility                                              |
|----------------|-------------------------------------------------------------|
| `AuthModule`   | LINE OAuth exchange, JWT issue/refresh, guard middleware    |
| `UsersModule`  | User profile (coach or client role)                        |
| `CoachesModule`| Coach profile, service catalogue, availability rules       |
| `BookingsModule`| Booking lifecycle: pending → confirmed → completed/cancelled|
| `PaymentsModule`| ECPay checkout generation, return/result webhook handlers  |
| `WebhookModule`| LINE Messaging API webhook (follow, message, postback events)|
| `NotificationsModule`| Queued LINE push messages via Bull + Redis           |
| `HealthModule` | `/health` endpoint for Docker / load-balancer checks       |

### Infrastructure

```
docker-compose.yml        ← local dev (Postgres + Redis included)
docker-compose.prod.yml   ← production (Supabase + Upstash, no local DB)
nginx/nginx.conf          ← reverse proxy, TLS, security headers
.github/workflows/ci.yml  ← lint → test → build → deploy pipeline
```

---

## Data Flow

### Booking Flow (happy path)

```
Client opens LIFF
  → LINE authenticates user (OAuth 2.0)
  → Frontend exchanges LINE code for JWT (POST /api/auth/line/callback)
  → Frontend loads coach page (GET /api/coaches/:slug)
  → Client selects slot (GET /api/coaches/:id/availability)
  → Client submits booking (POST /api/bookings)
  → Backend creates Booking(PENDING), generates ECPay checkout URL
  → Frontend redirects to ECPay payment page
  → ECPay calls RETURN_URL (POST /api/payments/ecpay/return) — sync
  → Backend verifies checksum, updates Booking(CONFIRMED)
  → Backend pushes LINE confirmation message to coach + client
  → ECPay calls ORDER_RESULT_URL (POST /api/payments/ecpay/result) — async
```

### LINE Webhook Flow

```
LINE Platform → POST /api/webhook/line
  → Signature validation (X-Line-Signature HMAC-SHA256)
  → Event routing:
      follow    → create/upsert User record
      message   → echo / FAQ auto-reply
      postback  → booking quick-actions (confirm / cancel)
```

### Authentication Flow

```
Browser → GET /auth/line (redirect to LINE Login)
LINE   → GET /auth/callback?code=...&state=...
Backend → POST /api/auth/line/callback
  → exchange code for LINE access_token
  → fetch LINE profile (userId, displayName, pictureUrl)
  → upsert User in DB
  → issue JWT access_token (15 min) + refresh_token (7 days, stored in Redis)
  → return tokens to frontend
```

---

## Key Design Decisions

1. **Multi-tenancy via coach slug** — each coach has a unique URL slug; no subdomain per tenant (keeps TLS simple on a single VPS).

2. **Stateless JWT + Redis refresh** — access tokens are short-lived and verified in memory; refresh tokens are stored in Redis with TTL, enabling instant revocation.

3. **ECPay synchronous return + async result** — ECPay calls RETURN_URL synchronously before redirecting the buyer; we update booking state there. ORDER_RESULT_URL is a secondary async callback for reconciliation.

4. **Bull queue for LINE notifications** — push messages are queued in Redis/Bull to handle LINE rate limits and retry on failure without blocking HTTP responses.

5. **Supabase connection pooler** — use the "Transaction" pooler URL (`pgbouncer`) for the backend to avoid exhausting Postgres connections on the free tier.
