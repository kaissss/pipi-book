# ============================================================
# PiPiBook Backend — NestJS Multi-Stage Dockerfile
# Build context: repo root (monorepo)
# ============================================================

# ------------------------------------------------------------
# Stage 1: Dependencies
# ------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

# Copy workspace root manifests + backend package.json
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json

# Install only backend workspace deps
RUN npm ci --workspace=backend --ignore-scripts

# ------------------------------------------------------------
# Stage 2: Builder
# ------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# Copy backend source
COPY backend/ ./backend/
COPY package.json ./

WORKDIR /app/backend

# Generate Prisma client
RUN npx prisma generate

# Compile NestJS
RUN npm run build

# Prune to prod deps only
WORKDIR /app
RUN npm ci --workspace=backend --omit=dev --ignore-scripts && npm cache clean --force

# ------------------------------------------------------------
# Stage 3: Production runner
# ------------------------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl dumb-init

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/backend/dist        ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules        ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/backend/node_modules ./backend_modules
COPY --from=builder --chown=nestjs:nodejs /app/backend/prisma      ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/backend/package.json ./package.json

USER nestjs

EXPOSE 4000

ENV NODE_ENV=production \
    PORT=4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
