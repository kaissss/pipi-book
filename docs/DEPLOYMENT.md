# PiPiBook — Deployment Guide

Target: **$0–20/month** using free-tier cloud services.

---

## Service Map

| Service        | Provider          | Cost         | Purpose                      |
|----------------|-------------------|--------------|------------------------------|
| Backend API    | Railway / Render  | Free–$5/mo   | NestJS Docker container      |
| Frontend       | Vercel            | Free         | Next.js                      |
| Database       | Supabase          | Free         | PostgreSQL 16                |
| Cache / Queue  | Upstash           | Free         | Redis (10k cmd/day free)     |
| DNS + Proxy    | Cloudflare        | Free         | CDN, WAF, SSL                |
| Container Reg. | GitHub Packages   | Free         | Docker images (GHCR)         |
| CI/CD          | GitHub Actions    | Free         | 2,000 min/month free         |

---

## Step 1 — Supabase (Database)

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Choose a region close to Taiwan (e.g. Southeast Asia / Singapore).
3. Copy both connection strings from **Project Settings → Database**:
   - **Transaction pooler** (port 6543) → `DATABASE_URL`
   - **Direct connection** (port 5432) → `DIRECT_URL`

```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

4. Run migrations from your local machine (first deploy only):

```bash
DATABASE_URL="$DIRECT_URL" npx prisma migrate deploy
```

---

## Step 2 — Upstash (Redis)

1. Go to [upstash.com](https://upstash.com) → **Create Database** → choose Redis.
2. Region: **ap-southeast-1** (Singapore).
3. Copy the **Redis URL** (format: `rediss://...@...upstash.io:6379`).

```env
REDIS_URL=rediss://default:[password]@[endpoint].upstash.io:6379
```

---

## Step 3 — LINE Developers Console

1. Log in at [developers.line.biz/console](https://developers.line.biz/console).
2. Create a **Provider** → add two channels:
   - **LINE Login** channel → copy **Channel ID** and **Channel Secret**
   - **Messaging API** channel → issue a **Channel Access Token** (long-lived)
3. Under LINE Login → **LIFF** tab → add a LIFF app:
   - Endpoint URL: `https://yourdomain.com/book`
   - Scope: `profile openid`
   - Copy the **LIFF ID**
4. Under LINE Login → **Callback URL**: `https://yourdomain.com/auth/callback`

```env
LINE_CHANNEL_ID=1234567890
LINE_CHANNEL_SECRET=abc123...
LINE_CHANNEL_ACCESS_TOKEN=very_long_token...
LINE_LIFF_ID=1234567890-abcdefgh
LINE_REDIRECT_URI=https://yourdomain.com/auth/callback
```

---

## Step 4 — ECPay (Payment Gateway)

1. Register at [vendor.ecpay.com.tw](https://vendor.ecpay.com.tw).
2. For testing, use the sandbox merchant:
   - `ECPAY_MERCHANT_ID=2000132`
   - `ECPAY_HASH_KEY=5294y06JbISpM5x9`
   - `ECPAY_HASH_IV=v77hoKGq4kWxNNIS`
3. For production, apply for a real merchant account (requires Taiwan business registration).

```env
ECPAY_MERCHANT_ID=2000132
ECPAY_HASH_KEY=5294y06JbISpM5x9
ECPAY_HASH_IV=v77hoKGq4kWxNNIS
ECPAY_RETURN_URL=https://yourdomain.com/api/payments/ecpay/return
ECPAY_ORDER_RESULT_URL=https://yourdomain.com/api/payments/ecpay/result
```

---

## Step 5 — Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your GitHub repo.
2. Framework Preset: **Next.js** (auto-detected).
3. Root Directory: `frontend`
4. Add environment variables (all `NEXT_PUBLIC_*` vars + `BACKEND_URL`):

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_LINE_CHANNEL_ID=...
NEXT_PUBLIC_LINE_LIFF_ID=...
BACKEND_URL=https://api.yourdomain.com
```

5. Deploy. Vercel assigns `*.vercel.app` — add your custom domain under **Settings → Domains**.

---

## Step 6 — Railway (Backend API)

> Alternative: use Render (free plan available, cold starts on free tier).

### Railway

1. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**.
2. Select the `pipibook` repo. Railway detects the `backend/Dockerfile`.
3. Set **Root Directory** to `backend`.
4. Under **Variables**, add all backend environment variables (see `.env.example`).
5. Under **Settings → Networking**, expose port `4000` and note the generated domain.
6. Set a custom domain (e.g. `api.yourdomain.com`) and point a CNAME in Cloudflare.

### Render (alternative)

1. New Web Service → connect GitHub → select `pipibook`.
2. **Root Directory**: `backend` | **Dockerfile path**: `./Dockerfile`
3. Add environment variables.
4. Deploy.

---

## Step 7 — Cloudflare (DNS + CDN)

1. Add your domain to Cloudflare (change nameservers at your registrar).
2. Create DNS records:

| Type  | Name  | Content                        | Proxy |
|-------|-------|--------------------------------|-------|
| CNAME | @     | cname.vercel-dns.com           | ON    |
| CNAME | www   | cname.vercel-dns.com           | ON    |
| CNAME | api   | your-app.railway.app           | ON    |

3. SSL/TLS → set to **Full (strict)**.
4. Speed → Optimization → enable **Auto Minify** and **Brotli**.

---

## Step 8 — GitHub Secrets (CI/CD)

In your GitHub repo → **Settings → Secrets and variables → Actions**, add:

| Secret                   | Value                                          |
|--------------------------|------------------------------------------------|
| `SSH_HOST`               | Your VPS IP (if self-hosting) or skip          |
| `SSH_USERNAME`           | `deploy` (or your user)                        |
| `SSH_PRIVATE_KEY`        | Contents of `~/.ssh/id_ed25519`                |
| `SSH_PORT`               | `22` (default)                                 |
| `NEXT_PUBLIC_API_URL`    | `https://api.yourdomain.com`                   |
| `NEXT_PUBLIC_LINE_CHANNEL_ID` | Your LINE channel ID                      |
| `NEXT_PUBLIC_LINE_LIFF_ID`    | Your LIFF ID                              |
| `PRODUCTION_DOMAIN`      | `yourdomain.com`                               |

---

## Self-Hosted VPS Option (Optional, ~$5/mo on Hetzner/DigitalOcean)

If you prefer a single VPS over Railway + Vercel:

```bash
# On your VPS (Ubuntu 22.04)
sudo apt update && sudo apt install -y docker.io docker-compose-plugin

# Create deploy user
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy

# Create app directory
sudo mkdir -p /opt/pipibook
sudo chown deploy:deploy /opt/pipibook

# Copy production env file
scp .env.production deploy@your-vps:/opt/pipibook/.env.production

# Copy compose file
scp docker-compose.prod.yml deploy@your-vps:/opt/pipibook/
scp -r nginx deploy@your-vps:/opt/pipibook/

# First deploy
ssh deploy@your-vps
cd /opt/pipibook
docker compose -f docker-compose.prod.yml up -d
```

For TLS on self-hosted, use Certbot:

```bash
sudo apt install -y certbot
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com
# Certs saved to /etc/letsencrypt/live/yourdomain.com/
# Copy fullchain.pem + privkey.pem to /opt/pipibook/nginx/certs/
```

---

## Production Checklist

- [ ] All secrets added to GitHub Actions
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are 64+ byte random strings
- [ ] `DATABASE_URL` uses Supabase transaction pooler (port 6543)
- [ ] `DIRECT_URL` uses Supabase direct connection (port 5432)
- [ ] LINE webhook URL registered: `https://yourdomain.com/api/webhook/line`
- [ ] ECPay return URLs are HTTPS and publicly reachable
- [ ] Cloudflare SSL set to Full (strict)
- [ ] Health endpoint responds: `curl https://yourdomain.com/health`
- [ ] First migration deployed: `npx prisma migrate deploy`
- [ ] Smoke test: create a coach account, set availability, complete a booking

---

## Monitoring (Free)

- **Uptime**: [uptimerobot.com](https://uptimerobot.com) — monitor `/health`, free for 50 monitors
- **Errors**: Supabase built-in logs, Railway/Render log streams
- **DB**: Supabase Table Editor and SQL editor in the dashboard
