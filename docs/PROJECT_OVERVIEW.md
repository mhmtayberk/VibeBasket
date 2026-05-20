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

## Trusted Catalog Model

The catalog is no longer intended to be a mostly manual seed list. It is now designed around three layers:

- `verified` curated entries maintained by VibeBasket
- trusted upstream MCP metadata from the official MCP Registry
- trusted upstream skill metadata from the official `skills.sh` catalog surface

When multiple sources describe the same item, VibeBasket deduplicates by canonical identity and gives precedence to curated verified records.

## Recent State

Recent work significantly changed the catalog behavior:

- fixed catalog loading stability problems
- fixed selected-state visibility and unselect behavior in the UI
- replaced brittle registry sync stubs with live trusted-source collectors
- added pagination so large catalogs remain usable
- added API-side sync locking and DB indexing to reduce repeated work
- server-rendered the first catalog page so the builder can show useful results even if client hydration or the initial browser fetch is delayed
- aligned the target picker with the real adapter-backed set and removed stale watchlist-only entries
- converted the homepage AI IDE strip back into a sliding icon marquee

## Current Constraints

- full-catalog sync is now functionally correct but still expensive at large scale
- persistence currently works, but the registry write path should be optimized further with batching/transaction improvements
- catalog search uses SQL `LIKE`; it is acceptable for now but not the final search architecture for very large datasets
- lockfile health matters: the repo now depends on a refreshed `pnpm-lock.yaml` after the registry package gained `js-yaml`
