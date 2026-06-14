# ============================================================
# PiPiBook Frontend — Next.js Multi-Stage Dockerfile
# Uses Next.js "standalone" output mode for minimal image size.
# Add  output: 'standalone'  to next.config.js before building.
# ============================================================

# ------------------------------------------------------------
# Stage 1: Dependencies
# ------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# ------------------------------------------------------------
# Stage 2: Builder
# ------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args for public env vars baked at build time
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_LINE_CHANNEL_ID
ARG NEXT_PUBLIC_LINE_LIFF_ID

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_LINE_CHANNEL_ID=$NEXT_PUBLIC_LINE_CHANNEL_ID \
    NEXT_PUBLIC_LINE_LIFF_ID=$NEXT_PUBLIC_LINE_LIFF_ID \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ------------------------------------------------------------
# Stage 3: Production runner (standalone)
# ------------------------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache dumb-init

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# standalone output bundles everything needed to run
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
