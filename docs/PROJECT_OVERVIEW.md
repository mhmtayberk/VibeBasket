# VibeBasket - Project Overview

VibeBasket is the "Ninite for vibe coding". It gives users a single web catalog where they can browse trusted MCP servers, skills, rules, and workflow packs, collect them into a basket, and generate a shareable bundle URL plus a single CLI command to apply the setup locally.

## Product Goal

The product exists to make AI development environments portable, repeatable, and safe across multiple IDEs. Instead of installing one MCP or one skill at a time in one editor at a time, users should be able to assemble a setup once and reuse it anywhere.

## Current Target Model

As of June 13, 2026, the product exposes 24 adapter-backed IDE targets: Cursor, Windsurf, VS Code/Cline, Antigravity, Claude Code, DeepSeek-TUI, Zed, Codex CLI, Gemini CLI, Junie, Kiro, Cline CLI, Continue, Roo Code, Hermes, OpenClaw, GitHub Copilot, Void Editor, Aider, Cortex Code, Goose, IBM Bob, CodeBuddy, and OpenCode.

For targets that support it (11 total: Claude Code, Continue, Roo Code, Hermes, OpenClaw, GitHub Copilot, Void Editor, Aider, Cortex Code, IBM Bob, and CodeBuddy), the CLI adapter also installs Skills and Rules using idempotent block delimiters to avoid corrupting existing developer configurations.

## Core Experience

1. Browse the trusted catalog in the web app.
2. Filter by item type and search by name or description.
3. Select or unselect items directly from the catalog UI.
4. Generate a bundle URL and a CLI apply command.
5. Apply the bundle locally with idempotent IDE adapters.

Automatic local apply is fully supported for MCP configuration across all 16 target adapters. Skills and rules are additionally auto-installed for Continue, Roo Code, Hermes, and OpenClaw using our idempotent block delimiter engine.

## Trusted Catalog Model

The catalog is no longer intended to be a mostly manual seed list. It is now designed around three layers:

- `verified` curated entries maintained by VibeBasket
- trusted upstream MCP metadata from the official MCP Registry
- trusted upstream skill metadata from the public `skills.sh` catalog corpus, ingested through the published sitemap surfaces

When multiple sources describe the same item, VibeBasket deduplicates by canonical identity and gives precedence to curated verified records.

## Recent State

Recent work significantly changed the catalog behavior, deployment, and security baseline:

- **Dockerization & Production Config:** Multi-stage production `Dockerfile` based on Node.js 22 Alpine utilizing lean Next.js standalone build outputs, root privilege isolation, and SQLite volume persistence. Added `docker-compose.yml` with automated container health probes and `.dockerignore` shielding.
- **Performanslı ve Güvenli Health Check (`/api/health`):** Real-time database connectivity check through a lightweight Drizzle select. Safeguarded against flooding/DoS attacks via a 5-second in-memory status cache, with explicit HTTP no-cache headers.
- **Information Disclosure Mitigation in Sitemap:** Dynamic sitemap.ts generator updated to index `/docs` under weekly changeFrequency, strictly auditing sitemap queries to prevent accidental leakage of private user bundle paths or admin roots.
- **XSS, LFI/RFI Defenses & Whitelisting:** Secured `/docs` tab-based rendering by pre-verifying queries against an allowed whitelist. Shielded search input from ReDoS/XSS payloads by restricting inputs to 100 characters.
- **Expanded Search Scope:** Enriched keywords map for all guides in the `/docs` bento grid, enabling users to search long-tail keywords like "Docker", "compose", "volume", and "security" instantly.
- **GitHub OAuth Redirect Spec:** Added a dedicated callout spec in `/docs?tab=self-hosting` and registered `.env.example` under Git tracking.
- **Idempotent Delimiter Engine:** Roo Code (`.clinerules`), Hermes (`.hermesrules`), and OpenClaw (`.openclawrules`) IDE adapters use `>>> VIBEBASKET START/END <<<` block delimiters for idempotent rule/skill writes.
- **Semver Deduplication Engine:** `OfficialMcpRegistryCollector` groups servers by `server.name` and ingests only the highest semver release, eliminating multi-version catalog duplicates (e.g. FAF Context).

## Current Constraints

- full-catalog sync is functionally correct but still expensive at large scale; `pnpm catalog:sync` is the recommended hook for periodic refreshes
- catalog search uses SQL `LIKE`; acceptable for now but not the final search architecture for very large datasets
- same-name skills from distinct upstream repos are intentionally preserved unless canonical source identity proves they are mirrors; correctness wins over aggressive title-based merging
- adapter-backed support is MCP-first today; Skills/Rules/Workflow auto-apply is only live for Continue, Roo Code, Hermes, and OpenClaw; even there, the CLI prompts rather than silently overwriting user configurations
- the docs hub at `/docs` supports fully-functional interactive search with 300ms client debouncing; versioned documentation is a future improvement
