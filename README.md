# VibeBasket

Bundle trusted MCP servers, agent skills, and project rules into one shareable install command. Apply across 24 AI IDEs and CLI tools with a single link.

[![Version](https://img.shields.io/badge/version-0.9.0-blue)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](tsconfig.base.json)
[![CI](https://img.shields.io/badge/ci-github_actions-green)](https://github.com/vibebasket/vibebasket/actions/workflows/ci.yml)
[![Security](https://img.shields.io/badge/security-CodeQL%20%2B%20Dependabot-blue)](https://github.com/vibebasket/vibebasket/security)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## What is VibeBasket?

Stop manually configuring MCP servers one IDE at a time. Browse a trusted catalog that syncs tens of thousands of community and official integrations, pick what you need, and generate a single `npx` command that installs everything — idempotently, with automatic backups, across every tool you use.

```
npx vibebasket apply https://vibebasket.dev/api/bundle/cj2k9x
```

## What VibeBasket Is Good At

- Standardizing MCP-heavy setups across multiple AI IDEs and terminal tools
- Turning one curated stack into a repeatable install flow for a team or project
- Keeping install behavior idempotent so re-applying a bundle is safe
- Letting self-hosters run the whole stack on a single VPS without adding Redis, Postgres, or extra infra

## What It Does Not Try To Be

- A hosted secrets manager for end-user runtime credentials
- A multi-node control plane with shared cache/state infrastructure by default
- A universal package manager for arbitrary IDE extensions outside MCPs, Skills, and Rules

## Supported IDEs (24 Targets)

| IDE | MCP | Skills | Rules |
|-----|:---:|:------:|:-----:|
| Cursor | ✅ | — | ✅ |
| Windsurf | ✅ | — | — |
| VS Code / Cline | ✅ | — | — |
| Claude Code | ✅ | ✅ | — |
| GitHub Copilot | — | ✅ | ✅ |
| Continue | ✅ | ✅ | — |
| Roo Code | ✅ | ✅ | ✅ |
| Codex CLI | ✅ | — | — |
| Gemini CLI | ✅ | — | — |
| Antigravity | ✅ | — | — |
| JetBrains Junie | ✅ | — | — |
| Kiro | ✅ | — | — |
| Cline CLI | ✅ | — | — |
| Zed | ✅ | — | — |
| Hermes | ✅ | ✅ | — |
| OpenClaw | ✅ | ✅ | — |
| Void Editor | ✅ | ✅ | ✅ |
| Aider | — | ✅ | ✅ |
| DeepSeek-TUI | ✅ | — | — |
| Cortex Code | ✅ | ✅ | — |
| Goose | ✅ | — | — |
| IBM Bob | ✅ | ✅ | — |
| CodeBuddy | ✅ | ✅ | — |
| OpenCode | ✅ | — | — |

11 adapters auto-install Skills. 5 auto-install Rules. All MCP-capable adapters auto-install MCP servers.

## Features

### Web Catalog
- Tens of thousands of items when synced from the official MCP Registry, the public skills.sh catalog, and curated sources
- Trust tiers: Verified (curated), Official (upstream), Community — no misleading scores
- FTS5 full-text search with prefix matching across display name, description, and source URL
- Filter by type, trust tier, source freshness, and sort order
- Detail view per item: install command, GitHub repo, sync freshness

### CLI
- `apply` — Install bundles from URLs or local files (`--force`, `--scope`, `--dry-run`)
- `list` — Scan all 24 IDEs for installed MCPs, skills, and rules
- `search` — Search the catalog from terminal
- `doctor` — Diagnose IDE configurations across all targets
- `init` — Scaffold a VibeBasket project
- `rollback` — Restore from timestamped backups

### Security
- End-user runtime secrets never appear in bundle manifests and are prompted locally by the CLI
- AES-256-GCM encrypted storage credentials
- Sliding-window rate limiting on 8 API endpoints with Retry-After headers
- CSP and security headers enforced in production
- Path sanitization on all file operations
- 4 OAuth providers: GitHub, Google, Apple, Microsoft Entra ID
- GitHub Actions CI, CodeQL scanning, and Dependabot update automation

### Admin Dashboard
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
- Self-host on one machine: use Docker first
- Hack on the repo: use the manual workspace setup

### Docker

```bash
git clone https://github.com/vibebasket/vibebasket.git
cd vibebasket
cp .env.example .env
docker compose up -d
```

After first boot, either wait for background catalog bootstrap or run `pnpm catalog:sync`, then verify freshness at `/api/catalog/status`.

Expected first-run behavior:

- the app comes up before the full catalog is necessarily warm
- the first live sync may take noticeably longer than ordinary page loads
- `/api/catalog/status` is the quickest way to confirm counts, freshness, and latest sync outcome

### Manual

```bash
git clone https://github.com/vibebasket/vibebasket.git
cd vibebasket
cp .env.example .env
pnpm install
pnpm dev
```

After first boot, either wait for background catalog bootstrap or run `pnpm catalog:sync`, then verify freshness at `/api/catalog/status`.

Open [http://localhost:3000](http://localhost:3000).

## Self-Hosting Expectations

VibeBasket is currently optimized for **single-node deployments**.

- Recommended default: one VPS, one Next.js process, one SQLite database file
- Rate limiting is process-local in memory by design
- Backup/storage/admin features are built around that simple deployment shape
- If you choose to run multiple replicas or add external state infrastructure, that is possible territory for advanced operators, but it is not the default operating model the docs optimize for

If you want the simplest stable setup, use Docker Compose or the Helm chart in single-replica mode.

## Production Readiness

VibeBasket is designed for self-hosting as well as the public hosted product.

- Docker and Helm deployment surfaces are included in the repo
- `/api/health` is safe to use for container and orchestration health checks
- `/api/catalog/status` exposes catalog freshness and sync health
- A production checklist lives in [docs/PRODUCTION_READINESS_CHECKLIST.md](docs/PRODUCTION_READINESS_CHECKLIST.md)

Current release-engineering note:

- The repo is verified through `pnpm verify:ci`, targeted web typecheck, build, unit/integration tests, and Playwright smoke coverage.
- A monorepo-wide `tsc -b` gate is not yet a release requirement; there is still project-reference cleanup to finish in `packages/adapters` and `apps/cli`.

Operational reality:

- The product is production-usable today for the intended single-node shape
- Catalog quality depends on upstream source health plus local sync freshness
- Some adapters support MCP only, while others also support Skills and Rules; VibeBasket exposes those distinctions instead of pretending every target has the same surface

### Kubernetes

```bash
helm install vibebasket ./charts/vibebasket \
  --set env.NEXTAUTH_URL=https://vibebasket.example.com \
  --set env.AUTH_SECRET=$(openssl rand -base64 32)
```

## CLI Usage

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
| `AUTH_GITHUB_ID/SECRET` | No | GitHub OAuth credentials |
| `AUTH_GOOGLE_ID/SECRET` | No | Google OAuth credentials |
| `AUTH_APPLE_ID/SECRET` | No | Apple Sign-In credentials |
| `AUTH_MICROSOFT_ENTRA_ID_ID/SECRET` | No | Microsoft Entra ID credentials |
| `BACKUP_STORAGE_BACKEND` | No | local, s3, r2, spaces, azure, or gcs |
| `ADMIN_OAUTH_EMAILS` | No | Comma-separated admin emails; admin access is granted only when the signed-in account email is both allowlisted and verified |
| `TRUST_PROXY` | No | Set to `true` only when the app is actually behind a trusted reverse proxy; proxy IP headers are ignored otherwise |

See [`.env.example`](.env.example) for the complete list.

## Architecture

```
packages/
├── core/          Zod schemas, Drizzle ORM, SQLite bootstrap (WAL, 64MB cache)
├── adapters/      24 IDE adapters (16 on BaseAdapter, 8 custom)
├── registry/      Catalog sync from MCP Registry + skills.sh + verified.yaml
apps/
├── web/           Next.js 16 App Router — catalog UI, API, admin dashboard
└── cli/           Node.js CLI — apply, list, search, doctor, init, rollback
charts/
└── vibebasket/    Helm chart (Recreate strategy, uid 1001, existingSecret)
```

Key patterns: idempotent config writes, immutable bundles, DB-first configuration, BaseAdapter class hierarchy, Strategy pattern for storage backends, FTS5 with trigger-based content sync.

## Notes

- SQLite with WAL mode. For multi-replica deployments, use Turso.
- Anonymous bundles expire in 48 hours. Registered user bundles last 365 days.
- OAuth is optional. Catalog browsing and bundle apply work without login.
- Admin access: set `ADMIN_OAUTH_EMAILS` or configure from admin panel at `/admin`. Production admin access requires an allowlisted and verified email address.
- Cookie-authenticated stack create/update/delete routes enforce same-origin browser mutations to reduce CSRF risk.
- Catalog sync is eventually consistent. If upstream sources change, your local instance reflects that after background refresh or a manual `pnpm catalog:sync`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). We use pnpm workspaces, Biome for formatting, Vitest for testing, Playwright for browser coverage, and conventional commits.

## Community

- [Contributing Guide](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

## Security

Report vulnerabilities via [GitHub Security Advisories](https://github.com/vibebasket/vibebasket/security/advisories/new). See [SECURITY.md](SECURITY.md) for the full threat model.

## License

MIT
