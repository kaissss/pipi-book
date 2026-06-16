# ============================================================
# PiPiBook Backend — NestJS Multi-Stage Dockerfile
# Build context: backend/ directory
# ============================================================

# ------------------------------------------------------------
# Stage 1: prod-deps
# ------------------------------------------------------------
FROM node:20-alpine AS prod-deps

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package.json ./
RUN npm install --omit=dev --ignore-scripts

# ------------------------------------------------------------
# Stage 2: all-deps
# ------------------------------------------------------------
FROM node:20-alpine AS all-deps

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package.json ./
RUN npm install --ignore-scripts

# ------------------------------------------------------------
# Stage 3: builder
# ------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=all-deps /app/node_modules ./node_modules

COPY . .

RUN npx prisma generate
RUN npm run build

# ------------------------------------------------------------
# Stage 4: production runner
# ------------------------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl dumb-init

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nestjs

COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules           ./node_modules
COPY --from=builder   --chown=nestjs:nodejs /app/node_modules/.prisma   ./node_modules/.prisma
COPY --from=builder   --chown=nestjs:nodejs /app/dist                   ./dist
COPY --from=builder   --chown=nestjs:nodejs /app/prisma                 ./prisma
COPY --from=builder   --chown=nestjs:nodejs /app/package.json           ./package.json

USER nestjs

EXPOSE 4000

ENV NODE_ENV=production \
    PORT=4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
