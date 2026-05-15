# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
- Established the monorepo, schema layer, IDE adapters, CLI apply flow, web catalog, and bundle endpoints.
- Added Drizzle + LibSQL catalog and bundle storage.
- Stabilized ESM/type/build behavior across the monorepo.
- Implemented responsive catalog browsing and floating basket flows.
- Added tests for DB resolution, registry sync, dev origins, and basket selection state.

### Recent catalog and registry work

- Fixed catalog loading issues caused by unstable DB path resolution.
- Added deterministic DB resolution from the workspace root.
- Fixed local dev origin handling for non-`localhost` browsing during Next.js development.
- Replaced stubbed registry sync assumptions with live trusted-source collectors.
- Updated official MCP Registry parsing to match the current upstream payload shape.
- Switched skills ingestion to the public official `skills.sh` surface instead of a brittle API assumption.
- Added source-level sync isolation so one upstream failure does not collapse the entire catalog refresh.
- Expanded the local catalog from a tiny seed set to thousands of trusted MCP and skill entries.

### Recent UX and performance work

- Fixed catalog item selection state so selected items are visibly marked.
- Added proper unselect/toggle behavior for catalog items.
- Added page-based pagination in both the catalog API and web UI.
- Limited page size and reset pagination on tab/search changes.
- Added single-flight sync protection so concurrent catalog requests do not trigger duplicate sync jobs.
- Added automatic SQLite indexes for the main catalog query paths.
- Refreshed the homepage and builder UI around a Stitch-inspired technical-editorial visual system.
- Added a desktop basket panel and a cleaner mobile basket entry flow.
- Changed stale catalog refresh behavior so normal requests serve cached data immediately while background sync continues separately.
- Reduced the hero headline scale and converted the AI editor strip into a marquee motion row.
- Added richer target metadata so the UI can list popular AI editors while the bundle API still validates supported targets only.
- Added a light fragmented noise treatment to the global background layer.
- Prevented oversized basket panels by summarizing item counts and collapsing long selections behind an explicit expand action.
- Expanded the visible target watchlist to include a broader set of popular AI IDEs and agent CLIs without weakening backend validation.
- Split the basket target area into supported targets and a compact ecosystem watchlist.
- Added real adapters for Claude Code, Zed, Gemini CLI, Junie, Kiro, and Cline CLI.
- Replaced abbreviated target labels in the basket panel with full product names.
- Added a real Codex CLI adapter based on the official `~/.codex/config.toml` MCP surface.
- Fixed project-scope apply so adapters now receive the actual project root when resolving config paths.
