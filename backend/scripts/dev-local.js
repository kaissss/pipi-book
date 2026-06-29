/**
 * Local dev launcher.
 *
 * Prisma auto-loads `.env` (the deployed config) into process.env at import
 * time, and neither Prisma's nor Nest's dotenv overrides an already-set var.
 * So `.env.local` can't override keys that also exist in `.env` (e.g.
 * CORS_ORIGINS, NODE_ENV). Setting them here as real env vars wins over both,
 * giving a reliable local setup without touching the deployed `.env`.
 */
const { spawn } = require('child_process');

const localEnv = {
  NODE_ENV: 'development',
  CORS_ORIGINS: 'http://localhost:3000',
  FRONTEND_URL: 'http://localhost:3000',
  DEV_LOGIN_ENABLED: 'true',
};

for (const [key, value] of Object.entries(localEnv)) {
  process.env[key] = value;
}

spawn('npm', ['run', 'start:dev'], { stdio: 'inherit', shell: true });
