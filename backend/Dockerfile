# ============================================================
# PiPiBook Backend — NestJS Multi-Stage Dockerfile
# Build context: repo root (monorepo)
# ============================================================

# ------------------------------------------------------------
# Stage 1: prod-deps — install production dependencies only
# ------------------------------------------------------------
FROM node:20-alpine AS prod-deps

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json

RUN npm ci --workspace=backend --omit=dev --ignore-scripts

# ------------------------------------------------------------
# Stage 2: all-deps — install all dependencies (inc. devDeps)
# ------------------------------------------------------------
FROM node:20-alpine AS all-deps

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json

RUN npm ci --workspace=backend --ignore-scripts

# ------------------------------------------------------------
# Stage 3: builder — compile TypeScript + generate Prisma
# ------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=all-deps /app/node_modules ./node_modules
COPY --from=all-deps /app/backend/node_modules ./backend/node_modules

COPY backend/ ./backend/
COPY package.json ./

WORKDIR /app/backend

RUN npx prisma generate
RUN npm run build

# ------------------------------------------------------------
# Stage 4: production runner — minimal image, non-root user
# ------------------------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl dumb-init

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nestjs

COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules        ./node_modules
COPY --from=builder   --chown=nestjs:nodejs /app/backend/dist        ./dist
COPY --from=builder   --chown=nestjs:nodejs /app/backend/prisma      ./prisma
COPY --from=builder   --chown=nestjs:nodejs /app/backend/package.json ./package.json

USER nestjs

EXPOSE 4000

ENV NODE_ENV=production \
    PORT=4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
