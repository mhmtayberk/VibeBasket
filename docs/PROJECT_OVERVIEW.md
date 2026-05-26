# VibeBasket - Project Overview

VibeBasket is the "Ninite for vibe coding". It gives users a single web catalog where they can browse trusted MCP servers, skills, rules, and workflow packs, collect them into a basket, and generate a shareable bundle URL plus a single CLI command to apply the setup locally.

## Product Goal

The product exists to make AI development environments portable, repeatable, and safe across multiple IDEs. Instead of installing one MCP or one skill at a time in one editor at a time, users should be able to assemble a setup once and reuse it anywhere.

## Current Target Model

As of May 15, 2026, the product exposes a single adapter-backed target set rather than mixing installable targets with a visible watchlist. The current supported landscape includes Cursor, Windsurf, VS Code/Cline, Antigravity, Claude Code, Zed, Codex CLI, Gemini CLI, JetBrains Junie, Kiro, and Cline CLI.

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

Recent work significantly changed the catalog behavior:

- fixed catalog loading stability problems
- fixed selected-state visibility and unselect behavior in the UI
- replaced brittle registry sync stubs with live trusted-source collectors
- corrected `skills.sh` official/community provenance classification after tracing escaped repo identifiers from the upstream page parser
- switched skills ingestion to the full public `skills.sh` sitemap corpus and tightened canonical skill identity around `repo + full path + ref`
- improved search ranking so exact and prefix display-name matches beat broader description/source JSON matches
- centralized target capability metadata while keeping the web client on a metadata-only import path, so supported-target UX stays in sync with adapters without dragging server-only modules into browser bundles
- added pagination so large catalogs remain usable
- added trust/freshness filtering and sorting so catalog exploration can follow confidence signals instead of only raw search text
- added API-side sync locking and DB indexing to reduce repeated work
- server-rendered the first catalog page so the builder can show useful results even if client hydration or the initial browser fetch is delayed
- aligned the target picker with the real adapter-backed set and removed stale watchlist-only entries
- converted the homepage AI IDE strip back into a sliding icon marquee
- fixed adapter MCP serialization for remote servers so supported targets now write proper HTTP-based MCP config instead of invalid `command: "remote"` payloads
- hardened CLI apply so unsupported scopes or target write failures abort the run instead of pretending success

## Current Constraints

- full-catalog sync is now functionally correct but still expensive at large scale
- persistence currently works, but the registry write path should be optimized further with batching/transaction improvements
- catalog search uses SQL `LIKE`; it is acceptable for now but not the final search architecture for very large datasets
- same-name skills from distinct upstream repos are intentionally preserved unless canonical source identity proves they are mirrors; correctness currently wins over aggressive title-based merging
- lockfile health matters: the repo now depends on a refreshed `pnpm-lock.yaml` after the registry package gained `js-yaml`
