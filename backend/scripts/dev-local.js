/**
 * Local dev launcher.
 *
 * Prisma auto-loads `.env` (the deployed config) into process.env at import
 * time, and neither Prisma's nor Nest's dotenv overrides an already-set var.
 * So `.env.local` can't override keys that also exist in `.env` (e.g.
 * CORS_ORIGINS, NODE_ENV, the ECPay callback URLs). Setting them here as real
 * env vars wins over both, giving a reliable local setup without touching the
 * deployed `.env`.
 *
 * Any value you export in your shell before running still wins (see the
 * `?? ` below) — that's how you point the ECPay webhook at a tunnel, e.g.:
 *   ECPAY_RETURN_URL=https://<sub>.ngrok.io/payments/webhook npm run start:local
 */
const { spawn } = require('child_process');

const localEnv = {
  NODE_ENV: 'development',
  CORS_ORIGINS: 'http://localhost:3000',
  FRONTEND_URL: 'http://localhost:3000',
  DEV_LOGIN_ENABLED: 'true',
  // ECPay callback URLs. In `.env` these point at the Railway backend, so
  // without overriding them a local payment would call production. Point them
  // at the local backend (PORT 4000) instead. NOTE: ReturnURL is a
  // server-to-server webhook ECPay calls from its own servers — it cannot
  // reach `localhost`, so payment confirmation won't fire locally unless you
  // expose the backend via a tunnel (ngrok/cloudflared) and override the URL.
  // OrderResultURL is POSTed by the user's own browser, so localhost is fine.
  ECPAY_RETURN_URL: 'http://localhost:4000/payments/webhook',
  ECPAY_ORDER_RESULT_URL: 'http://localhost:4000/payments/result',
};

for (const [key, value] of Object.entries(localEnv)) {
  // Respect an explicit shell-provided value (e.g. a tunnel URL); otherwise
  // apply the local default.
  process.env[key] = process.env[key] ?? value;
}

spawn('npm', ['run', 'start:dev'], { stdio: 'inherit', shell: true });
