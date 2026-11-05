ARG NODE_IMAGE=node:24.22.2-alpine3.24

# ──────────────────────────────────────────────
# Stage 1: dependency install (cached layer)
# ──────────────────────────────────────────────
FROM ${NODE_IMAGE} AS deps
WORKDIR /app

ARG PNPM_VERSION=11.7.0

# Install pnpm via corepack (matches engines.pnpm in package.json)
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Copy workspace manifests only (maximise cache hit rate)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/cli/package.json                         apps/cli/package.json
COPY apps/web/package.json                         apps/web/package.json
COPY packages/core/package.json                    packages/core/package.json
COPY packages/registry/package.json               packages/registry/package.json
COPY packages/adapters/package.json               packages/adapters/package.json

# Install all deps (including devDeps needed for build)
RUN pnpm install --frozen-lockfile


# Preserve the platform-specific libSQL package directory name. A wildcarded
# Docker COPY flattens its contents, which prevents Node.js from resolving it.
FROM deps AS runtime-deps
RUN mkdir -p /runtime/node_modules/@libsql \
 && cp -R /app/node_modules/@libsql/linux-*-musl /runtime/node_modules/@libsql/


# ──────────────────────────────────────────────
# Stage 2: build
# ──────────────────────────────────────────────
FROM ${NODE_IMAGE} AS builder
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
FROM ${NODE_IMAGE} AS runner
WORKDIR /app

# Keep the runtime OS patched and remove package managers that are not used in
# production. Builds and dependency installation stay in the earlier stages.
RUN apk add --upgrade --no-cache musl \
 && rm -rf /usr/local/lib/node_modules/npm \
           /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm \
           /usr/local/bin/npx \
           /usr/local/bin/corepack \
           /usr/local/bin/pnpm \
           /usr/local/bin/pnpx \
           /usr/local/bin/yarn \
           /usr/local/bin/yarnpkg

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Only copy the Next.js standalone output + static assets
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static     ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public           ./apps/web/public

# The standalone output already contains the web runtime dependency graph.
# Catalog sync additionally imports these externalized packages directly.
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/argparse    ./node_modules/argparse
COPY --from=runtime-deps --chown=nextjs:nodejs /runtime/node_modules/@libsql ./node_modules/@libsql
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/drizzle-orm ./node_modules/drizzle-orm
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/js-yaml     ./node_modules/js-yaml
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/zod         ./node_modules/zod

# Copy catalog-sync script (needed for first-run seeding)
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/packages/core/package.json ./packages/core/package.json
COPY --from=builder --chown=nextjs:nodejs /app/packages/core/dist     ./packages/core/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/registry/package.json ./packages/registry/package.json
COPY --from=builder --chown=nextjs:nodejs /app/packages/registry/dist ./packages/registry/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/registry/data ./packages/registry/data

# Data directory for the SQLite database (mounted as a Docker volume)
RUN mkdir -p /data && chown nextjs:nodejs /data

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_PATH=/app/node_modules

# Health check using the built-in /api/health endpoint
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=30s \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

CMD ["node", "apps/web/server.js"]
