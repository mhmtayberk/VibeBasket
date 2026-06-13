# VibeBasket

**The Ninite for Vibe Coding.** Bundle trusted MCP servers, agent skills, and project rules into one shareable install command. Apply across 24 AI IDEs and CLI tools with a single link.

[![Version](https://img.shields.io/badge/version-0.9.0-blue)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](.)
[![Tests](https://img.shields.io/badge/tests-340%2B-green)](.)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## What is VibeBasket?

Stop manually configuring MCP servers one IDE at a time. Browse a trusted catalog of 40K+ community and official integrations, pick what you need, and generate a single `npx` command that installs everything — idempotently, with automatic backups, across every tool you use.

```
npx vibebasket apply https://vibebasket.dev/api/bundle/cj2k9x
```

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

**11 adapters auto-install Skills. 5 adapters auto-install Rules.** All MCP-capable adapters auto-install MCP servers.

## Features

### Web Catalog
- **40K+ items** from official MCP Registry, skills.sh, and VibeBasket curated sources
- **Trust tiers**: Verified (curated), Official (upstream), Community — no misleading scores
- **Search + Filter**: By type, trust tier, source, and FTS5 full-text search
- **Catalog Detail**: Click any item to see installation command, GitHub repo, freshness
- **Bundle Preview**: See exactly what will be installed before generating

### CLI
- **`apply`** — Install bundles from URLs or local files
- **`list`** — Scan all 24 IDEs for installed MCPs, skills, and rules
- **`search`** — Search the catalog from the terminal
- **`doctor`** — Diagnose IDE configurations across all targets
- **`init`** — Scaffold a new VibeBasket project
- **`rollback`** — Restore previous IDE configurations from backup

### Security
- **Zero-knowledge**: API keys and secrets never sent to our servers. Prompted locally by CLI.
- **AES-256-GCM encryption**: Cloud storage credentials encrypted at rest in SQLite
- **Rate limiting**: Sliding window on all 9 API endpoints with Retry-After headers
- **CSP + security headers**: Production Content-Security-Policy, X-Frame-Options, nosniff
- **Path sanitization**: All file operations use `path.basename()` + character whitelists
- **4 OAuth providers**: GitHub, Google, Apple, Microsoft Entra ID — independently gateable

### Backup & Storage
- **6 backends**: Local filesystem, AWS S3, Cloudflare R2, DigitalOcean Spaces, Azure Blob, GCS
- **Scheduled backups**: Configurable hourly intervals
- **Admin panel**: Manage storage config, trigger syncs, view metrics — no restart needed
- **Encrypted credentials**: Cloud API keys encrypted before DB storage

### Admin Dashboard
- Real-time metrics: registered users, saved stacks, popular integrations
- Manual catalog sync trigger with audit trail
- Backup management: create, list, restore, delete
- Storage backend configuration with credential forms
- FTS5 health monitoring and rebuild
- Database health checks and force cleanup
- User overview and admin email management

## Quick Start

### Docker (Recommended)

```bash
git clone https://github.com/vibebasket/vibebasket.git
cd vibebasket
cp .env.example .env
# Edit .env with your AUTH_SECRET and NEXTAUTH_URL
docker compose up -d
```

### Manual Install

```bash
git clone https://github.com/vibebasket/vibebasket.git
cd vibebasket
cp .env.example .env
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

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

# Or from local file
npx vibebasket apply ./my-bundle.json

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

# Restore backup
npx vibebasket rollback
```

## Configuration

### Required Environment Variables

| Variable | Description |
|---|---|
| `AUTH_SECRET` | Random 64-char secret for session encryption |
| `NEXTAUTH_URL` | Public deployment URL |
| `DATABASE_URL` | SQLite path (default: `file:vibebasket.db`) |

### Optional

| Variable | Description |
|---|---|
| `AUTH_GITHUB_ENABLED/ID/SECRET` | GitHub OAuth |
| `AUTH_GOOGLE_ENABLED/ID/SECRET` | Google OAuth |
| `AUTH_APPLE_ENABLED/ID/SECRET` | Apple OAuth |
| `AUTH_MICROSOFT_ENTRA_ID_ENABLED/ID/SECRET` | Microsoft Entra ID |
| `BACKUP_STORAGE_BACKEND` | local, s3, r2, spaces, azure, gcs |
| `TRUST_PROXY` | true behind reverse proxy |
| `VIBEBASKET_API_URL` | CLI catalog search endpoint |

See [`.env.example`](.env.example) for the complete list.

## Architecture

```
packages/
├── core/          Zod schemas, Drizzle ORM, SQLite bootstrap
├── adapters/      24 IDE adapters (Cursor, Windsurf, Claude Code, etc.)
├── registry/      Catalog sync from MCP Registry + skills.sh + verified.yaml
apps/
├── web/           Next.js 16 App Router — catalog UI, API, admin dashboard
└── cli/           Node.js CLI — apply, list, search, doctor, init, rollback
```

**Key patterns**: Idempotent config writes, immutable bundles, DB-first configuration, lazy-loaded cloud SDKs, BaseAdapter class hierarchy, Strategy pattern for storage backends.

## Important Notes

- **Single-writer SQLite**: WAL mode allows concurrent reads. Use Turso for multi-replica.
- **Anonymous bundles expire in 48h**. Registered user bundles last 365 days.
- **OAuth is optional**: Catalog browsing works without login.
- **Backup storage defaults to local filesystem**. Cloud backends require additional SDK packages.
- **Admin access**: Set `ADMIN_OAUTH_EMAILS` env var or configure from the admin panel.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). We use:
- **pnpm** workspaces
- **Biome** for formatting/linting
- **Vitest** for testing
- **Conventional Commits**

## Security

Report vulnerabilities to `security@vibebasket.dev`. See [SECURITY.md](SECURITY.md) for our threat model and security practices.

## License

MIT © VibeBasket Team
