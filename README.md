# PiPiBook

LINE-integrated coach booking SaaS for independent fitness, wellness, and skill coaches in Taiwan.

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Next.js 14 (App Router, TypeScript) |
| Backend    | NestJS 10 (TypeScript)            |
| Database   | PostgreSQL 16 via Supabase        |
| Cache / Queue | Redis 7 via Upstash            |
| Auth       | LINE Login (OAuth 2.0) + JWT      |
| Payments   | ECPay                             |
| Messaging  | LINE Messaging API + LIFF         |
| Infra      | Docker, Nginx, GitHub Actions     |

## Prerequisites

- Node.js >= 20
- Docker Desktop
- A LINE Developers account (free) — [developers.line.biz](https://developers.line.biz)

## Quick Start (local development)

```bash
# 1. Clone and install workspace dependencies
git clone https://github.com/your-org/pipibook.git
cd pipibook
npm install

# 2. Copy environment template
cp .env.example .env
# → Edit .env and fill in LINE_CHANNEL_ID, LINE_CHANNEL_SECRET, etc.

# 3. Start all services (Postgres, Redis, backend, frontend)
docker compose up -d

# 4. Run database migrations
docker compose exec backend npx prisma migrate dev

# 5. Open the app
open http://localhost:3000        # frontend
open http://localhost:4000/api    # backend Swagger
```

The backend auto-reloads on file changes; so does the frontend.

## Environment Setup

All environment variables are documented in `.env.example`.  
The minimum set needed to log in via LINE:

```
LINE_CHANNEL_ID
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
LINE_LIFF_ID
JWT_SECRET
JWT_REFRESH_SECRET
DATABASE_URL
REDIS_URL
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production values.

## Available Scripts

```bash
npm run dev          # start backend + frontend concurrently (no Docker)
npm run build        # build both packages
npm run lint         # lint both packages
npm run test         # run backend unit tests
npm run test:e2e     # run backend e2e tests
npm run format       # prettier format all files
```

## Project Structure

```
pipibook/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── auth/
│   │   ├── coaches/
│   │   ├── bookings/
│   │   ├── payments/
│   │   └── webhook/
│   └── prisma/
│       └── schema.prisma
├── frontend/         # Next.js app
│   ├── app/
│   │   ├── (coach)/  # coach dashboard pages
│   │   ├── (client)/ # client booking pages
│   │   └── auth/
│   └── components/
├── nginx/
│   └── nginx.conf
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml        # development
├── docker-compose.prod.yml   # production
└── .env.example
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full step-by-step guide.

**Target infra cost: $0–20 / month**

| Service     | Free Tier                              |
|-------------|----------------------------------------|
| Supabase    | 500 MB DB, 2 GB bandwidth             |
| Upstash     | 10,000 commands/day                   |
| Railway/Render | 512 MB RAM, shared CPU              |
| Vercel      | Hobby tier (frontend)                 |
| Cloudflare  | Free proxying + DDoS protection       |

## Contributing

1. Create a feature branch from `main`
2. Commit using conventional commits (`feat:`, `fix:`, `chore:`)
3. Open a PR — CI must pass before merge

## License

MIT
