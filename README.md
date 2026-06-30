# VibeBasket

![VibeBasket hero banner](.github/assets/readme-hero.jpg)

Bundle trusted MCP servers, agent skills, and project rules into one shareable install command. Apply across 24 AI IDEs and CLI tools with a single link.

[![Version](https://img.shields.io/badge/version-0.9.4-blue)](package.json)
[![npm](https://img.shields.io/npm/v/vibebasket)](https://www.npmjs.com/package/vibebasket)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](tsconfig.base.json)
[![CI](https://img.shields.io/badge/ci-github_actions-green)](https://github.com/mhmtayberk/VibeBasket/actions/workflows/ci.yml)
[![Security](https://img.shields.io/badge/security-CodeQL%20%2B%20Dependabot-blue)](https://github.com/mhmtayberk/VibeBasket/security)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## Table of Contents

- [What is VibeBasket?](#what-is-vibebasket)
- [Where It Fits](#where-it-fits)
- [What It Is Not](#what-it-is-not)
- [Supported IDEs](#supported-ides-24-targets)
- [Core Features](#core-features)
- [Quick Start](#quick-start)
- [Self-Hosting](#self-hosting)
- [CLI Usage](#cli-usage)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Repository Docs](#repository-docs)
- [Security](#security)
- [License](#license)

## What is VibeBasket?

Stop manually configuring MCP servers one IDE at a time. Browse a trusted catalog that syncs tens of thousands of community and official integrations, pick what you need, and generate a single `npx` command that installs everything — idempotently, with automatic backups, across every tool you use.

```
npx vibebasket apply https://vibebasket.dev/api/bundle/cj2k9x
```

The CLI is also published on npm as [`vibebasket`](https://www.npmjs.com/package/vibebasket).

For maintainers: keep any local npm credentials in your user-level `~/.npmrc` only when you intentionally need them for a manual local publish or private registry access. The repository deliberately does not rely on a tracked project `.npmrc`.

The repo is now wired for GitHub Actions-based npm publishing in [`.github/workflows/publish.yml`](.github/workflows/publish.yml). After the package is linked once in npm Trusted Publisher settings, published GitHub releases can publish with npm provenance and without a long-lived publish token. The workflow also keeps a manual `workflow_dispatch` path for maintainers who deliberately need a manual publish run.

## Where It Fits

- Standardizing MCP-heavy setups across multiple AI IDEs and terminal tools
- Turning one curated stack into a repeatable install flow for a team or project
- Keeping install behavior idempotent so re-applying a bundle is safe
- Letting self-hosters run the whole stack on a single VPS without adding Redis, Postgres, or extra infra

## What It Is Not

- A hosted secrets manager for end-user runtime credentials
- A multi-node control plane with shared cache/state infrastructure by default
- A universal package manager for arbitrary IDE extensions outside MCPs, Skills, and Rules

## Supported IDEs (24 Targets)

| IDE | MCP | Skills | Rules |
|-----|:---:|:------:|:-----:|
| Cursor | ✅ | ✅ | ✅ |
| Windsurf | ✅ | ✅ | ✅ |
| VS Code / Cline | ✅ | — | — |
| Claude Code | ✅ | ✅ | — |
| GitHub Copilot | — | ✅ | ✅ |
| Continue | ✅ | ✅ | — |
| Roo Code | ✅ | ✅ | ✅ |
| Codex CLI | ✅ | — | — |
| Gemini CLI | ✅ | ✅ | — |
| Antigravity | ✅ | — | — |
| JetBrains Junie | ✅ | — | — |
| Kiro | ✅ | ✅ | — |
| Cline CLI | ✅ | — | — |
| Zed | ✅ | ✅ | — |
| Hermes | ✅ | ✅ | — |
| OpenClaw | ✅ | ✅ | — |
| Void Editor | ✅ | — | — |
| Aider | — | ✅ | ✅ |
| DeepSeek-TUI | ✅ | — | — |
| Cortex Code | ✅ | ✅ | — |
| Goose | ✅ | — | — |
| IBM Bob | ✅ | ✅ | — |
| CodeBuddy | ✅ | ✅ | — |
| OpenCode | ✅ | ✅ | ✅ |

16 adapters auto-install Skills. 6 auto-install Rules. All MCP-capable adapters auto-install MCP servers.

## Core Features

### Catalog
- Tens of thousands of items when synced from the official MCP Registry, the public skills.sh catalog, and curated sources
- Trust tiers: Verified (curated), Official (upstream), Community — no misleading scores
- FTS5 full-text search with prefix matching across display name, description, and source URL
- Filter by type, trust tier, source freshness, and sort order
- Detail view per item: install command, GitHub repo, sync freshness

Important scope note:

- MCP coverage is intentionally bounded by the official MCP Registry plus curated verified overrides
- Skills coverage comes from the public `skills.sh` corpus plus curated verified overrides
- If a popular MCP is not published in the official registry, it will not appear automatically until it is curated or the upstream registry adds it

Catalog freshness note:

- ordinary catalog reads can trigger a background refresh when the local snapshot is stale
- that refresh path is request-driven, not a built-in always-on scheduler
- if you want deterministic freshness windows in production, schedule `pnpm catalog:sync` yourself

### CLI
- `apply` — Install bundles from URLs or local files (`--force`, `--scope`, `--dry-run`, `--no-verify`)
- `list` — Scan all 24 IDEs for installed MCPs, skills, and rules
- `search` — Search the catalog from terminal
- `doctor` — Diagnose IDE configurations across all targets
- `init` — Scaffold a VibeBasket project
- `rollback` — Restore from timestamped backups (run from the target project root for project-scoped configs)

### Security
- End-user runtime secrets never appear in bundle manifests and are prompted locally by the CLI; most targets then store them only in that machine's local IDE config surface
- AES-256-GCM encrypted storage credentials
- Sliding-window rate limiting on 8 API endpoints with Retry-After headers
- CSP and security headers enforced in production
- Path sanitization on all file operations
- 4 optional OAuth providers: GitHub, Google, Apple, Microsoft Entra ID
- GitHub Actions CI, CodeQL scanning, repo secret scanning, and Dependabot update automation
- Explicit `NEXT_PUBLIC_*` allowlist enforcement so new public env vars require intentional review

### Admin
- Catalog sync triggers, backup management (6 backends), storage config
- FTS5 health monitoring + rebuild, DB integrity checks, force cleanup
- User overview, admin email management

### Backup & Storage
- 6 backends: Local, AWS S3, Cloudflare R2, DigitalOcean Spaces, Azure Blob, GCS
- Scheduled backups with configurable intervals
- Encrypted credentials stored in SQLite, never in environment files
- Backup restore works across local and supported cloud storage backends

## Quick Start

Choose the path that matches what you are trying to do:

- Just use the hosted product: open [vibebasket.dev](https://vibebasket.dev), build a basket, copy the `npx vibebasket apply ...` command, and run it locally
- Prefer the published CLI package surface: use `npx vibebasket ...` or inspect the package page at [npmjs.com/package/vibebasket](https://www.npmjs.com/package/vibebasket)
- Self-host on one machine: use Docker first
- Hack on the repo: use the manual workspace setup

If you deploy with Coolify, prefer Dockerfile mode. Build Pack mode is also supported via the repo-level `nixpacks.toml`.

### Docker

```bash
git clone https://github.com/mhmtayberk/VibeBasket.git
cd VibeBasket
cp .env.example .env
# fill at least AUTH_SECRET and NEXTAUTH_URL before booting production mode
docker compose up -d
```

After first boot, either wait for background catalog bootstrap or run `docker compose exec web node scripts/catalog-sync.mjs`, then verify freshness at `/api/catalog/status`.

Expected first-run behavior:

- the app comes up before the full catalog is necessarily warm
- the first live sync may take noticeably longer than ordinary page loads
- `/api/catalog/status` is the quickest way to confirm counts, freshness, and latest sync outcome

### Manual

```bash
git clone https://github.com/mhmtayberk/VibeBasket.git
cd VibeBasket
cp .env.example .env
pnpm install
pnpm dev
```

After first boot, either wait for background catalog bootstrap or run `pnpm catalog:sync`, then verify freshness at `/api/catalog/status`.

Open [http://localhost:3000](http://localhost:3000).

## Self-Hosting

VibeBasket is currently optimized for **single-node deployments**: one app instance, one SQLite database, and no extra state infrastructure by default.

Start here:

- [SELF_HOSTING.md](SELF_HOSTING.md)
- [docs/SETUP.md](docs/SETUP.md)
- [docs/PRODUCTION_READINESS_CHECKLIST.md](docs/PRODUCTION_READINESS_CHECKLIST.md)

For the first admin account on a self-hosted instance, start with [SELF_HOSTING.md#bootstrap-the-first-admin](SELF_HOSTING.md#bootstrap-the-first-admin).

Operational notes:

- `/api/health` is safe for container and orchestration health checks
- `/api/catalog/status` exposes catalog freshness and latest sync state
- `pnpm catalog:sync:strict` is available as a pre-launch validation command
- the main CI gate is `pnpm verify:ci`

## CLI Usage

The official package name is [`vibebasket`](https://www.npmjs.com/package/vibebasket).

```bash
# Install from bundle URL
npx vibebasket apply https://vibebasket.dev/api/bundle/cj2k9x

# Options
npx vibebasket apply <url> --scope project --dry-run --force

# List installed configs
npx vibebasket list

# Search catalog
npx vibebasket search postgresql

# Environment check
npx vibebasket doctor

# Scaffold project
npx vibebasket init

# Restore from backup
npx vibebasket rollback
```

## Configuration

| Variable | Required | Description |
|----------|:--------:|-------------|
| `AUTH_SECRET` | Yes | Session encryption secret. Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Public deployment URL for OAuth callbacks |
| `AUTH_TRUST_HOST` | No | Set to `true` in production when running behind a trusted proxy or CDN |
| `AUTH_<PROVIDER>_ENABLED` | No | Must be truthy (`true`, `1`, `yes`, `on`) for a provider to appear in the login UI |
| `AUTH_GITHUB_ID/SECRET` | No | GitHub OAuth credentials |
| `AUTH_GOOGLE_ID/SECRET` | No | Google OAuth credentials |
| `AUTH_APPLE_ID/SECRET` | No | Apple Sign-In credentials |
| `AUTH_MICROSOFT_ENTRA_ID_ID/SECRET` | No | Microsoft Entra ID credentials |
| `CATALOG_REFRESH_TOKEN` | No | Required only if you want authenticated production callers to use `/api/catalog?refresh=1` |
| `CATALOG_FETCH_RETRIES` | No | Registry sync retry count for trusted upstream fetches. Default: `2` |
| `CATALOG_MCP_REGISTRY_TIMEOUT_MS` | No | Per-request timeout for official MCP Registry fetches. Default: `60000` |
| `CATALOG_SKILLS_TIMEOUT_MS` | No | Per-request timeout for `skills.sh` fetches. Default: `20000` |
| `BACKUP_STORAGE_BACKEND` | No | local, s3, r2, spaces, azure, or gcs |
| `ADMIN_OAUTH_EMAILS` | No | Comma-separated admin emails; admin access is granted only when the signed-in account email is both allowlisted and verified |
| `TRUST_PROXY` | No | Set to `true` only when the app is actually behind a trusted reverse proxy; proxy IP headers are ignored otherwise |

See [`.env.example`](.env.example) for the complete list.

OAuth note: provider buttons appear only when the provider is both enabled and fully configured.

## Architecture

Main parts of the repo:

- `packages/core`
  Shared schemas, SQLite bootstrap, and database access
- `packages/adapters`
  24 IDE and CLI adapters with target-specific install logic
- `packages/registry`
  Catalog sync from the official MCP Registry, `skills.sh`, and curated verified data
- `apps/web`
  Next.js web app, APIs, auth flows, saved stacks, and admin surfaces
- `apps/cli`
  Local installer CLI for apply, list, search, doctor, init, and rollback
- `charts/vibebasket`
  Helm chart for single-replica self-hosted deployments

Key patterns:

- idempotent config writes
- immutable bundle URLs
- DB-first configuration for admin-managed settings
- adapter capability checks instead of pretending every target supports the same surface
- FTS5-backed catalog search with persisted sync metadata

For more detail:

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)
- [docs/SETUP.md](docs/SETUP.md)

## Repository Docs

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SELF_HOSTING.md](SELF_HOSTING.md)

## Security

Repository guardrails:

- CI runs a repo-level secret scan with `gitleaks`.
- Executable and config files are checked for `NEXT_PUBLIC_*` usage, and only reviewed allowlisted names are accepted.
- local npm credentials, if you use them for a manual publish or private registry access, should stay in the user-level `~/.npmrc`, never in the repository.

Report vulnerabilities via [GitHub Security Advisories](https://github.com/mhmtayberk/VibeBasket/security/advisories/new). See [SECURITY.md](SECURITY.md) for the full threat model.

## License

MIT
