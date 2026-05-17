# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=22-alpine

# ---------- deps (full install for build) ----------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ---------- builder ----------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- scripts-deps (only what migrate.mjs / seed.mjs need) ----------
FROM node:${NODE_VERSION} AS scripts-deps
WORKDIR /scripts
RUN npm init -y >/dev/null && npm install --omit=dev pg@^8.13.1 --no-audit --no-fund

# ---------- runner ----------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV UPLOAD_DIR=/data/uploads

RUN addgroup -g 1001 -S nodejs \
 && adduser -S -u 1001 nextjs

# Standalone Next.js bundle (server.js + needed deps)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Migration scripts and their own deps (scoped to /app/scripts/node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/db ./db
COPY --from=builder --chown=nextjs:nodejs /app/data ./data
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=scripts-deps --chown=nextjs:nodejs /scripts/node_modules ./scripts/node_modules

RUN mkdir -p /data/uploads && chown -R nextjs:nodejs /data
VOLUME ["/data"]

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
