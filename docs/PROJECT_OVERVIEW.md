# VibeBasket - Project Overview

VibeBasket is the "Ninite for vibe coding". It gives users a single web catalog where they can browse trusted MCP servers, skills, rules, and workflow packs, collect them into a basket, and generate a shareable bundle URL plus a single CLI command to apply the setup locally.

## Product Goal

The product exists to make AI development environments portable, repeatable, and safe across multiple IDEs. Instead of installing one MCP or one skill at a time in one editor at a time, users should be able to assemble a setup once and reuse it anywhere.

## Current Target Model

The product now separates:

- **supported apply targets**: editors and tools with a real installer adapter behind them today
- **ecosystem watchlist targets**: popular AI editors and agent CLIs that are visible in the UI but intentionally not installable yet

As of May 15, 2026, the visible target landscape includes Cursor, Windsurf, VS Code/Cline, Antigravity, Claude Code, Zed, Codex CLI, Gemini CLI, JetBrains Junie, Kiro, Trae, and Cline CLI. The adapter-backed set now includes Cursor, Windsurf, VS Code/Cline, Antigravity, Claude Code, Zed, Codex CLI, Gemini CLI, JetBrains Junie, Kiro, and Cline CLI. `Trae` remains visible but not installable yet because we do not yet have a verifiable official MCP configuration surface to target.

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
- made the target picker more honest by listing both installable and roadmap AI environments

## Current Constraints

- full-catalog sync is now functionally correct but still expensive at large scale
- persistence currently works, but the registry write path should be optimized further with batching/transaction improvements
- catalog search uses SQL `LIKE`; it is acceptable for now but not the final search architecture for very large datasets
- the UI still reflects a slightly wider AI IDE ecosystem than the backend installer can truly apply; `Trae` remains the main visible-but-not-yet-installable target
