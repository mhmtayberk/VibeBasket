# ──────────────────────────────────────────────
# Stage 1: dependency install (cached layer)
# ──────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

ARG PNPM_VERSION=11.7.0

# Install pnpm via corepack (matches engines.pnpm in package.json)
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Copy workspace manifests only (maximise cache hit rate)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json                         apps/web/package.json
COPY packages/core/package.json                    packages/core/package.json
COPY packages/registry/package.json               packages/registry/package.json
COPY packages/adapters/package.json               packages/adapters/package.json

# Install all deps (including devDeps needed for build)
RUN pnpm install --frozen-lockfile


# ──────────────────────────────────────────────
# Stage 2: build
# ──────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
ARG PNPM_VERSION=11.7.0
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules            ./node_modules
COPY --from=deps /app/apps/web/node_modules   ./apps/web/node_modules

# Copy full source
COPY . .

# Build internal packages first, then the Next.js app
RUN pnpm --filter @vibebasket/core build \
 && pnpm --filter @vibebasket/registry build \
 && pnpm --filter @vibebasket/adapters build \
 && pnpm --filter web build


# ──────────────────────────────────────────────
# Stage 3: production runtime (lean image)
# ──────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Only copy the Next.js standalone output + static assets
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static     ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public           ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules              ./node_modules

# Copy catalog-sync script (needed for first-run seeding)
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/packages/core/dist     ./packages/core/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/registry/dist ./packages/registry/dist

# Data directory for the SQLite database (mounted as a Docker volume)
RUN mkdir -p /data && chown nextjs:nodejs /data

# Next standalone runtime still needs these externalized packages present at runtime.
# The deps stage already installed Linux-native copies, so we only need to preserve ownership here.
RUN chown -R nextjs:nodejs /app/node_modules

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_PATH=/app/node_modules

# Health check using the built-in /api/health endpoint
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=5s \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

CMD ["node", "apps/web/server.js"]
