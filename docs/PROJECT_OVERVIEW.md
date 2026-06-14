# VibeBasket - Project Overview

VibeBasket is the "Ninite for vibe coding". It gives users a single web catalog where they can browse trusted MCP servers, skills, rules, and workflow packs, collect them into a basket, and generate a shareable bundle URL plus a single CLI command to apply the setup locally.

## Product Goal

The product exists to make AI development environments portable, repeatable, and safe across multiple IDEs. Instead of installing one MCP or one skill at a time in one editor at a time, users should be able to assemble a setup once and reuse it anywhere.

## Current Target Model

The product currently exposes 24 adapter-backed IDE targets: Cursor, Windsurf, VS Code/Cline, Antigravity, Claude Code, DeepSeek-TUI, Zed, Codex CLI, Gemini CLI, Junie, Kiro, Cline CLI, Continue, Roo Code, Hermes, OpenClaw, GitHub Copilot, Void Editor, Aider, Cortex Code, Goose, IBM Bob, CodeBuddy, and OpenCode.

For targets that support it (11 total: Claude Code, Continue, Roo Code, Hermes, OpenClaw, GitHub Copilot, Void Editor, Aider, Cortex Code, IBM Bob, and CodeBuddy), the CLI adapter also installs Skills and/or Rules using idempotent file writes or block delimiters to avoid corrupting existing developer configurations.

## Core Experience

1. Browse the trusted catalog in the web app.
2. Filter by item type and search by name or description.
3. Select or unselect items directly from the catalog UI.
4. Generate a bundle URL and a CLI apply command.
5. Apply the bundle locally with idempotent IDE adapters.
6. Re-read the written target config and verify that expected MCP entries and supported skill/rule artifacts exist.

Automatic local apply is fully supported for MCP configuration across all MCP-capable targets. Skills and rules are additionally auto-installed on the adapters that explicitly implement them, and the CLI now performs post-install verification rather than assuming persistence succeeded.

## Trusted Catalog Model

The catalog is no longer intended to be a mostly manual seed list. It is now designed around three layers:

- `verified` curated entries maintained by VibeBasket
- trusted upstream MCP metadata from the official MCP Registry
- trusted upstream skill metadata from the public `skills.sh` catalog corpus, ingested through the published sitemap surfaces

When multiple sources describe the same item, VibeBasket deduplicates by canonical identity and gives precedence to curated verified records.

## Recent State

Recent work significantly changed the catalog behavior, deployment, and security baseline:

- **Dockerization & Production Config:** Multi-stage production `Dockerfile` based on Node.js 22 Alpine utilizing lean Next.js standalone build outputs, root privilege isolation, and SQLite volume persistence. Added `docker-compose.yml` with automated container health probes and `.dockerignore` shielding.
- **Kubernetes Helm Chart:** Chart at `charts/vibebasket/` with Recreate strategy, securityContext uid 1001, existingSecret support, PVC-backed SQLite persistence, and `/api/health`-based liveness/readiness probes.
- **Health Check (`/api/health`):** Real-time database connectivity check through a lightweight Drizzle select. Safeguarded against flooding/DoS attacks via a 5-second in-memory status cache, with explicit HTTP no-cache headers. Used by Docker HEALTHCHECK and Kubernetes probes.
- **Information Disclosure Mitigation:** Dynamic `sitemap.ts` indexes `/docs`, `/`, and `/stacks` but excludes user bundles (`/bundle/[id]`) and admin routes. `robots.ts` and `llms.txt` provide crawl guidance.
- **XSS, LFI/RFI Defenses:** Secured `/docs` tab-based rendering by pre-verifying queries against an allowed whitelist. Shielded search input from ReDoS/XSS payloads by restricting inputs to 100 characters.
- **Idempotent Delimiter Engine:** Roo Code (`.clinerules`), Hermes (`.hermesrules`), and OpenClaw (`.openclawrules`) IDE adapters use `>>> VIBEBASKET START/END <<<` block delimiters for idempotent rule/skill writes.
- **Semver Deduplication Engine:** `OfficialMcpRegistryCollector` groups servers by `server.name` and ingests only the highest semver release, eliminating multi-version catalog duplicates (e.g. FAF Context).
- **Install Verification:** `vibebasket apply` now performs a readback verification step after writes, confirming expected MCP entries and deterministic skill/rule artifacts when the adapter supports them.
- **Operational Visibility:** The admin dashboard now surfaces catalog freshness, sync resilience, collector health, FTS5 health/rebuild, DB health, force cleanup, user overview, and admin email management.
- **Performance:** Count cache (60s TTL) avoids expensive `COUNT(*)` on every page. Catalog API uses `Cache-Control: max-age=60, stale-while-revalidate=300`. Compound indexes on type + trust + name. FTS5 data column removed to reduce index size.
- **Mobile:** Basket FAB + bottom sheet on small viewports. Responsive catalog grid with adaptive column count.
- **Homepage:** "Who is this for" section, "How it works" section, marquee IDE icon strip. Server-rendered first catalog page.

## Current Constraints

- full-catalog sync is functionally correct but still expensive at large scale; `pnpm catalog:sync` is the recommended hook for periodic refreshes
- catalog search uses FTS5 full-text indexing; acceptable for current scale
- same-name skills from distinct upstream repos are intentionally preserved unless canonical source identity proves they are mirrors; correctness wins over aggressive title-based merging
- adapter-backed support is still MCP-first overall; not every target supports Skills or Rules, and capability metadata must remain strictly aligned with real adapter methods
- the docs hub at `/docs` supports fully-functional interactive search with 300ms client debouncing; versioned documentation is a future improvement
- repository CI is now centered around `pnpm verify:ci` plus Playwright smoke coverage, not a monorepo-wide `tsc -b` gate yet
