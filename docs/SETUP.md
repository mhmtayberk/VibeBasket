# Setup

This guide is for contributors and self-hosters. If you only want to use the hosted product, you do not need any of this setup; just build a basket in the web app and run the generated `npx vibebasket apply ...` command locally.

The published CLI package is [`vibebasket`](https://www.npmjs.com/package/vibebasket).

If you need npm authentication for publishing or private registry access, keep it in your user-level `~/.npmrc`. This repository intentionally does not track a project `.npmrc`, so auth tokens cannot be committed by accident during normal work.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation (Manual Dev Setup)](#installation-manual-dev-setup)
- [Installation (Docker Production Setup)](#installation-docker-production-setup)
- [Recommended Deployment Shape](#recommended-deployment-shape)
- [Running the Full Workspace](#running-the-full-workspace)
- [Running the Web App Only](#running-the-web-app-only)
- [Auth Environment](#auth-environment)
- [Admin Access Bootstrap](#admin-access-bootstrap)
- [Running the CLI](#running-the-cli)
- [Tests](#tests)
- [CI Verification](#ci-verification)
- [CLI Publishing](#cli-publishing)
- [Useful Catalog Debug Commands](#useful-catalog-debug-commands)
- [Operational Notes](#operational-notes)

## Prerequisites
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose (Optional, for containerized deployments)

## Installation (Manual Dev Setup)
```bash
git clone https://github.com/mhmtayberk/VibeBasket.git
cd VibeBasket
cp .env.example .env     # Copy the environment template
pnpm install
pnpm dev                 # Starts workspace dev server on http://localhost:3000
```

## Installation (Docker Production Setup)
For automated containerized self-hosting:
```bash
git clone https://github.com/mhmtayberk/VibeBasket.git
cd VibeBasket
cp .env.example .env     # Fill in required Auth.js and app secrets before boot
docker compose up -d     # Starts non-root containers with automatic SQLite volume mounts
```

After startup, either wait for the background catalog bootstrap to finish or run `docker compose exec web node scripts/catalog-sync.mjs`, then check `http://localhost:3000/api/catalog/status`.

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

Each provider is independently gated. A provider is shown only when its `*_ENABLED` flag is truthy (`1`, `true`, `yes`, or `on`) and its credentials are present.

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

**Notes:**

- Self-hosted deployments can enable any subset of providers.
- Apple should be treated as optional for self-hosting; if it is not configured, it simply does not appear in the UI.
- Microsoft Entra ID is optional too; keep it disabled unless you actually want that provider in the login surface.
- Anonymous catalog browsing still works when all auth providers are disabled.
- In local development, the app falls back to a dev-only auth secret if `AUTH_SECRET` is missing so Auth.js does not spam the console; production still requires a real `AUTH_SECRET`.
- In production behind a reverse proxy or CDN, set `AUTH_TRUST_HOST=true` so OAuth callback URL handling trusts the forwarded host correctly.
- Only set `TRUST_PROXY=true` when the app is actually behind a trusted proxy or CDN that overwrites incoming client IP headers.
- `ADMIN_OAUTH_EMAILS` only grants admin access when the signed-in provider account also reports the email as verified.
- Cookie-authenticated saved-stack mutations enforce same-origin `Origin` checks, so `NEXTAUTH_URL` should reflect the real public app origin. Read-only stack fetches do not require that mutation header.

## Admin Access Bootstrap

For the first admin in a self-hosted deployment:

1. enable at least one OAuth provider
2. set `ADMIN_OAUTH_EMAILS` to the email you want to allow
3. sign in with that provider account
4. confirm the provider reports that email as verified

Example:

```bash
ADMIN_OAUTH_EMAILS=you@example.com
```

**Notes:**

- this is the bootstrap path for first admin access
- after that, the admin UI can manage the allowlist in the database
- in local non-production development only, `admin@vibebasket.dev` is treated as a dev admin shortcut

## Running the CLI
```bash
pnpm --filter vibebasket build
node apps/cli/dist/index.js --help
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

This runs the `NEXT_PUBLIC_*` allowlist guard, guardrail tests, linting, shared-package builds, the web app typecheck, the production web build, and the unit/integration test suites used by GitHub Actions.

The GitHub Actions workflow also runs a repository secret scan with `gitleaks` before the heavier build and test jobs begin.

## CLI Publishing

The npm package is published as [`vibebasket`](https://www.npmjs.com/package/vibebasket).

The repository is prepared for npm Trusted Publisher + provenance publishing through [`.github/workflows/publish.yml`](../.github/workflows/publish.yml). Before the first automated publish, configure the package once on npm:

1. open the package settings on npm
2. add a GitHub Actions trusted publisher
3. set owner to `mhmtayberk`
4. set repository to `VibeBasket`
5. set workflow filename to `publish.yml`
6. allow the `npm publish` action

After that, publishing a GitHub release triggers an OIDC-backed `npm publish --access public` flow. npm automatically attaches provenance for trusted publishers, so no long-lived npm token or extra provenance flag is required in the repo workflow.

The publish workflow intentionally runs on Node 24 so the bundled npm CLI satisfies npm's current Trusted Publishing requirement (`npm` 11.5.1+).

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

Run a strict sync check that exits non-zero when any upstream source still fails:

```bash
pnpm catalog:sync:strict
```

## Operational Notes

- The main SQLite DB currently lives at the workspace root as `vibebasket.db`
- Catalog sync can pull very large upstream datasets, so first syncs may take noticeably longer than normal page reads
- The web app ensures useful catalog indexes at runtime for local development and simple deployments
- The catalog status route reports current counts, freshness, and the latest recorded sync summary
- In production, `refresh=1` on `/api/catalog` is protected; callers must send `x-vibebasket-refresh-token` matching `CATALOG_REFRESH_TOKEN`
- `pnpm catalog:sync` is the safest hook for cron or external schedulers because it records sync audit metadata as well as refreshing catalog rows
- keep npm publish tokens in `~/.npmrc`, not in repo files or `.env`
- adding a new `NEXT_PUBLIC_*` variable is treated as a security-sensitive change; only extend `scripts/check-public-env.mjs` when the value is intentionally safe for client-side exposure
- request-triggered background refresh is opportunistic; if you need predictable freshness windows, prefer cron/systemd/Kubernetes scheduling around `pnpm catalog:sync`
- `pnpm catalog:sync:strict` is the safest pre-launch/manual validation command because it fails fast when one of the trusted upstream collectors still has source errors
- `pnpm catalog:sync` and `pnpm catalog:sync:dry` now emit collector progress to stderr, which makes long first-run syncs easier to distinguish from true hangs
- Catalog rows now carry item-level freshness/source metadata; after a live sync you can inspect `source_name`, `source_url`, `first_seen_at`, `last_seen_at`, and `last_synced_at` in `vibebasket.db`
- If the official MCP Registry or `skills.sh` is slow from your region or network, tune `CATALOG_FETCH_RETRIES`, `CATALOG_MCP_REGISTRY_TIMEOUT_MS`, and `CATALOG_SKILLS_TIMEOUT_MS` instead of editing the sync code
- Auth state and saved stacks are stored in the same application database; if you self-host with SQLite, back up `vibebasket.db` accordingly
- If you configure S3/R2/Spaces/Azure/GCS backups, confirm the admin panel does not show a storage fallback warning before assuming cloud backups are active
- Cloud backup restore now uses provider-native download flows; validate one full restore cycle in your own environment before relying on it operationally
- The Helm chart now expects sensitive values such as `AUTH_SECRET` and OAuth client secrets under `secretEnv`, or via `existingSecret`, rather than plain `.Values.env`
- Before exposing a public domain, walk through [Production Readiness Checklist](./PRODUCTION_READINESS_CHECKLIST.md)
- Multi-instance or externally shared state deployments are not the default path documented here; operators who go beyond the single-node model should validate rate limiting, SQLite strategy, and backup assumptions themselves
