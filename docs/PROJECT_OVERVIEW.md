# VibeBasket - Project Overview

VibeBasket is the "Ninite for vibe coding". It gives users a single web catalog where they can browse trusted MCP servers, skills, rules, and workflow packs, collect them into a basket, and generate a shareable bundle URL plus a single CLI command to apply the setup locally.

## Product Goal

The product exists to make AI development environments portable, repeatable, and safe across multiple IDEs. Instead of installing one MCP or one skill at a time in one editor at a time, users should be able to assemble a setup once and reuse it anywhere.

## Current Target Model

As of May 26, 2026, the product exposes a single adapter-backed target set. The current supported landscape includes Cursor, Windsurf, VS Code/Cline, Antigravity, Claude Code, DeepSeek-TUI, Zed, Codex CLI, Gemini CLI, JetBrains Junie, Kiro, Cline CLI, Continue, Roo Code, Hermes, and OpenClaw.

For targets that support it (Continue, Roo Code, Hermes, OpenClaw), the CLI adapter also installs Skills (Prompts) and Rules using idempotent block delimiters to avoid corrupting existing developer configurations.

## Core Experience

1. Browse the trusted catalog in the web app.
2. Filter by item type and search by name or description.
3. Select or unselect items directly from the catalog UI.
4. Generate a bundle URL and a CLI apply command.
5. Apply the bundle locally with idempotent IDE adapters.

At the moment, automatic local apply is intentionally limited to MCP configuration. Skills, rules, and workflow files remain part of the bundle format and web catalog, but they are not yet auto-installed by the CLI adapters.

## Trusted Catalog Model

The catalog is no longer intended to be a mostly manual seed list. It is now designed around three layers:

- `verified` curated entries maintained by VibeBasket
- trusted upstream MCP metadata from the official MCP Registry
- trusted upstream skill metadata from the public `skills.sh` catalog corpus, ingested through the published sitemap surfaces

When multiple sources describe the same item, VibeBasket deduplicates by canonical identity and gives precedence to curated verified records.

## Recent State

Recent work significantly changed the catalog behavior and design system:

- fixed catalog loading stability problems and selected-state visibility
- replaced brittle registry sync stubs with live trusted-source collectors
- **semver deduplication engine:** `OfficialMcpRegistryCollector` now groups servers by `server.name` and ingests only the highest semver release, eliminating duplicate cards for packages with multiple historical versions (e.g. nine `.FAF Context` entries reduced to one)
- corrected `skills.sh` official/community provenance classification
- switched skills ingestion to the full public `skills.sh` sitemap corpus with tighter canonical skill identity (`repo + full path + ref`)
- improved search ranking so exact/prefix display-name matches rank above broader description/source JSON matches
- centralized target capability metadata with a metadata-only web client import path
- added pagination, trust/freshness filtering and sorting, API-side sync locking and DB indexing
- server-rendered the first catalog page so the builder shows useful results before client hydration
- fixed adapter MCP serialization for remote servers
- hardened CLI apply so unsupported scopes or target write failures abort instead of pretending success
- resolved SQLite locking (`SQLITE_BUSY`) via `PRAGMA busy_timeout = 5000` and full WAL mode
- hardened Codex CLI TOML adapter for single/double quoted server identifiers
- **docs hub:** built the `/docs` documentation center with spacious bento layout, sidebar navigation, tabbed guides, and brand-coherent design system (sharp 2px borders, OLED dark mode)
- **design system baseline:** set `--radius: 0.125rem` globally, added surface container color tokens, and resolved the Next.js route smooth-scroll warning
- **rate limiter hardening:** hybrid IP detection with Cloudflare header, `TRUST_PROXY` env var, and in-memory leak cleanup sweeper
- **delimiter engine:** Roo Code, Hermes, and OpenClaw adapters use `>>> VIBEBASKET START/END <<<` block delimiters for idempotent rule/skill writes

## Current Constraints

- full-catalog sync is functionally correct but still expensive at large scale; `pnpm catalog:sync` is the recommended hook for periodic refreshes
- catalog search uses SQL `LIKE`; acceptable for now but not the final search architecture for very large datasets
- same-name skills from distinct upstream repos are intentionally preserved unless canonical source identity proves they are mirrors; correctness wins over aggressive title-based merging
- adapter-backed support is MCP-first today; Skills/Rules/Workflow auto-apply is only live for Continue, Roo Code, Hermes, and OpenClaw; even there, the CLI prompts rather than silently overwriting user configurations
- the docs hub at `/docs` serves static tabbed content for now; interactive search and versioned content are future improvements
