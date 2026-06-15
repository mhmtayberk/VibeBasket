# Setup

## Prerequisites
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose (Optional, for containerized deployments)

## Installation (Manual Dev Setup)
```bash
git clone <repo_url>
cd vibebasket
cp .env.example .env     # Copy the environment template
pnpm install
pnpm dev                 # Starts workspace dev server on http://localhost:3000
```

## Installation (Docker Production Setup)
For automated containerized self-hosting:
```bash
git clone <repo_url>
cd vibebasket
cp .env.example .env     # Fill in required Next-Auth and Auth secrets
docker compose up -d     # Starts non-root containers with automatic SQLite volume mounts
```

After startup, either wait for the background catalog bootstrap to finish or run `pnpm catalog:sync`, then check `http://localhost:3000/api/catalog/status`.

## Recommended Deployment Shape

If you are self-hosting VibeBasket for real usage, the recommended default is:

- one server
- one app instance
- one SQLite database file
- no Redis
- no shared cache layer

That is the shape the current docs, admin tooling, rate limiting model, and backup flows are optimized around.


## Running the Full Workspace
```bash
pnpm dev
```

## Running the Web App Only
```bash
pnpm --filter web dev
```

## Auth Environment

Set a session secret for any deployment that enables login:

```bash
AUTH_SECRET=replace-with-a-long-random-secret
AUTH_TRUST_HOST=true
```

Each social provider is independently gated. A provider is shown only when its `*_ENABLED` flag is truthy (`1`, `true`, `yes`, or `on`) and its credentials are present.

GitHub:

```bash
AUTH_GITHUB_ENABLED=true
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
```

Google:

```bash
AUTH_GOOGLE_ENABLED=true
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

Apple:

```bash
AUTH_APPLE_ENABLED=true
AUTH_APPLE_ID=...
AUTH_APPLE_SECRET=...
```

Microsoft Entra ID (Azure AD):

```bash
AUTH_MICROSOFT_ENTRA_ID_ENABLED=true
AUTH_MICROSOFT_ENTRA_ID_ID=...
AUTH_MICROSOFT_ENTRA_ID_SECRET=...
```

Notes:

- Self-hosted deployments can enable any subset of providers.
- Apple should be treated as optional for self-hosting; if it is not configured, it simply does not appear in the UI.
- Anonymous catalog browsing still works when all auth providers are disabled.
- In local development, the app falls back to a dev-only auth secret if `AUTH_SECRET` is missing so Auth.js does not spam the console; production still requires a real `AUTH_SECRET`.
- In production behind a reverse proxy or CDN, set `AUTH_TRUST_HOST=true` so OAuth callback URL handling trusts the forwarded host correctly.
- Only set `TRUST_PROXY=true` when the app is actually behind a trusted proxy or CDN that overwrites incoming client IP headers.
- `ADMIN_OAUTH_EMAILS` only grants admin access when the signed-in provider account also reports the email as verified.
- Cookie-authenticated saved-stack mutations enforce same-origin `Origin` checks, so `NEXTAUTH_URL` should reflect the real public app origin.

## Running the CLI
```bash
pnpm --filter @vibebasket/cli dev
```

## Tests
```bash
pnpm test
```

## CI Verification

The main repository verification command is:

```bash
pnpm verify:ci
```

This runs linting, shared-package builds, the web app typecheck, the production web build, and the unit/integration test suites used by GitHub Actions.

## Useful Catalog Debug Commands

Test API and database health status (with 5s in-memory cache protection):

```bash
curl -i "http://localhost:3000/api/health"
```

Fetch the first page of MCPs:

```bash
curl "http://localhost:3000/api/catalog?type=mcp&page=1&limit=24"
```

Force a refresh before reading skills:

```bash
curl "http://localhost:3000/api/catalog?type=skill&page=1&limit=24&refresh=1"
```

Read catalog status and the most recent recorded sync:

```bash
curl "http://localhost:3000/api/catalog/status"
```


Run a manual live sync into the local DB:

```bash
pnpm catalog:sync
```

Run the same sync as a dry-run without persisting:

```bash
pnpm catalog:sync:dry
```

## Operational Notes

- The main SQLite DB currently lives at the workspace root as `vibebasket.db`
- Catalog sync can pull very large upstream datasets, so first syncs may take noticeably longer than normal page reads
- The web app ensures useful catalog indexes at runtime for local development and simple deployments
- The catalog status route reports current counts, freshness, and the latest recorded sync summary
- In production, `refresh=1` on `/api/catalog` is protected; callers must send `x-vibebasket-refresh-token` matching `CATALOG_REFRESH_TOKEN`
- `pnpm catalog:sync` is the safest hook for cron or external schedulers because it records sync audit metadata as well as refreshing catalog rows
- Catalog rows now carry item-level freshness/source metadata; after a live sync you can inspect `source_name`, `source_url`, `first_seen_at`, `last_seen_at`, and `last_synced_at` in `vibebasket.db`
- Auth state and saved stacks are stored in the same application database; if you self-host with SQLite, back up `vibebasket.db` accordingly
- If you configure S3/R2/Spaces/Azure/GCS backups, confirm the admin panel does not show a storage fallback warning before assuming cloud backups are active
- Cloud backup restore now uses provider-native download flows; validate one full restore cycle in your own environment before relying on it operationally
- Before exposing a public domain, walk through [Production Readiness Checklist](./PRODUCTION_READINESS_CHECKLIST.md)
- Multi-instance or externally shared state deployments are not the default path documented here; operators who go beyond the single-node model should validate rate limiting, SQLite strategy, and backup assumptions themselves
