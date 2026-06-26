# Self-Hosting VibeBasket

This is the short public guide for running VibeBasket yourself.

## Table of Contents

- [Recommended Shape](#recommended-shape)
- [Fastest Path](#fastest-path)
- [Production Basics](#production-basics)
- [Authentication](#authentication)
- [Bootstrap the First Admin](#bootstrap-the-first-admin)
- [Catalog Sync Reality](#catalog-sync-reality)
- [Backups](#backups)
- [Kubernetes](#kubernetes)
- [Before Going Public](#before-going-public)

For deeper implementation detail, use:

- [docs/SETUP.md](docs/SETUP.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/PRODUCTION_READINESS_CHECKLIST.md](docs/PRODUCTION_READINESS_CHECKLIST.md)

## Recommended Shape

VibeBasket is currently optimized for:

- one server
- one app instance
- one SQLite database file
- no Redis
- no shared cache layer

That is the operating model the current docs, admin tooling, rate limiting, and backup flows are built around.

## Fastest Path

```bash
git clone https://github.com/mhmtayberk/VibeBasket.git
cd VibeBasket
cp .env.example .env
# fill at least AUTH_SECRET and NEXTAUTH_URL before booting production mode
docker compose up -d
```

After first boot:

1. wait for the initial catalog bootstrap, or run `docker compose exec web node scripts/catalog-sync.mjs`
2. verify `/api/health`
3. verify `/api/catalog/status`

## Production Basics

At minimum, production deployments should set:

- `AUTH_SECRET`
- `NEXTAUTH_URL`

Often needed:

- `AUTH_TRUST_HOST=true` when running behind a trusted reverse proxy or CDN
- `TRUST_PROXY=true` only when your proxy overwrites client IP headers
- `CATALOG_REFRESH_TOKEN` if you want authenticated remote refresh calls

See [`.env.example`](.env.example) for the full environment surface.

## Authentication

Login is optional for anonymous catalog browsing and bundle generation.

Supported providers:

- GitHub
- Google
- Apple
- Microsoft Entra ID

Admin access is only granted when the signed-in account email is both:

- allowlisted in `ADMIN_OAUTH_EMAILS`
- reported by the provider as verified

## Bootstrap the First Admin

To create the first admin account in a self-hosted deployment:

1. enable at least one OAuth provider
2. set `ADMIN_OAUTH_EMAILS` to the email you want to allow
3. sign in with that provider account
4. make sure the provider reports that email as verified

Example:

```bash
ADMIN_OAUTH_EMAILS=you@example.com
```

Notes:

- this is the bootstrap path for initial admin access
- after that, the admin UI can manage the allowlist in the database
- in local non-production development only, `admin@vibebasket.dev` is treated as a dev admin shortcut

## Catalog Sync Reality

VibeBasket does not assume a permanent built-in sync daemon.

- normal traffic can trigger request-driven refresh behavior
- deterministic recurring freshness should come from your own scheduler

Recommended production hook:

```bash
pnpm catalog:sync
```

Pre-launch validation:

```bash
pnpm catalog:sync:strict
```

## Backups

Built-in backup storage supports:

- Local filesystem
- AWS S3
- Cloudflare R2
- DigitalOcean Spaces
- Azure Blob Storage
- Google Cloud Storage

Notes:

- storage credentials configured through the admin UI are encrypted at rest
- scheduled backups are supported
- built-in local backup/restore flows assume a file-based SQLite `DATABASE_URL`
- test at least one full restore cycle before trusting the setup operationally

## Kubernetes

A Helm chart is included in `charts/vibebasket/`.

Example:

```bash
helm install vibebasket ./charts/vibebasket \
  --set env.NEXTAUTH_URL=https://vibebasket.example.com \
  --set secretEnv.AUTH_SECRET=$(openssl rand -base64 32)
```

Use single-replica mode unless you are intentionally designing around the SQLite and process-local assumptions yourself.

## Before Going Public

Run through:

- [docs/PRODUCTION_READINESS_CHECKLIST.md](docs/PRODUCTION_READINESS_CHECKLIST.md)

At minimum, confirm:

- `pnpm --filter web build` succeeds
- `/api/health` is healthy
- `/api/catalog/status` shows recent successful syncs
- login works with your configured provider set
- one full backup and restore cycle has been tested
