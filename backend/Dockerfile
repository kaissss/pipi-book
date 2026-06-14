# ============================================================
# PiPiBook Backend — NestJS Multi-Stage Dockerfile
# ============================================================

# ------------------------------------------------------------
# Stage 1: Dependencies
# Install all deps (including devDeps) for the build step.
# ------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

# Install OS-level build tools needed by some native addons
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# ------------------------------------------------------------
# Stage 2: Builder
# Compile TypeScript, generate Prisma client.
# ------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client before compiling
RUN npx prisma generate

# Compile NestJS
RUN npm run build

# Prune devDependencies so the final image only carries prod deps
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# ------------------------------------------------------------
# Stage 3: Production runner
# Minimal Alpine image, non-root user, only prod artifacts.
# ------------------------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl dumb-init

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nestjs

# Copy compiled output + production node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist        ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/prisma      ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs

EXPOSE 4000

ENV NODE_ENV=production \
    PORT=4000

# dumb-init handles PID 1 signal forwarding properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
