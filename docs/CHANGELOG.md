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
- Removed `Trae` from the visible target list so the UI no longer advertises a path we do not support.
- Converted the hero target strip back into a sliding icon-only marquee.
- Collapsed the temporary watchlist concept now that the visible target list matches the real adapter-backed set.
- Refreshed the lockfile after the registry package added `js-yaml`, unblocking full workspace verification again.
- Fixed package manifest gaps that broke full-workspace verification: missing `drizzle-orm`, `nanoid`, `zod`, and `@types/node` declarations in the right workspaces.
- Fixed the Tailwind plugin import path so `apps/web` production builds no longer fail resolving `tailwindcss-animate`.
- Hardened adapter typing and registry typing so workspace typecheck now passes cleanly with `exactOptionalPropertyTypes`.
- Adjusted package type metadata to point at source entrypoints inside the monorepo, which matches the current internal-consumption model and avoids false broken-type surfaces during local verification.
- Changed empty-catalog behavior so the first catalog request seeds the local verified catalog immediately and runs the slower upstream sync in the background instead of blocking the UI on a full registry refresh.
- Added stronger homepage metadata, canonical handling, viewport theme color, and JSON-LD structured data for better SEO/readability by crawlers.
- Deferred non-refresh catalog sync scheduling until after the request path is free so initial reads do not contend with long-running SQLite writes.
- Added fetch timeouts to upstream registry collectors so slow upstreams fail fast instead of stalling the sync path indefinitely.
- Changed catalog persistence so partial upstream failures no longer prune previously synced items from healthy sources.
- Added a server-rendered initial catalog snapshot for the homepage so the catalog no longer depends on client hydration or the first browser-side `/api/catalog` request to escape the loading state.
- Verified the live dev server returns `8344` MCP entries through `/api/catalog` and renders the first catalog page in Firefox after reload.
- Fixed registry persistence loss caused by upstream MCP variants sharing the same generated ID; IDs now include canonical runtime/url/args identity.
- Normalized skills.sh canonical keys through the same helper used by local skill entries, removing case-only duplicate skill IDs.
- Confirmed live registry sync now produces `24534` persisted rows with `24534` distinct IDs and zero canonical duplicate MCP or skill rows.
- Protected production `refresh=1` catalog sync behind `CATALOG_REFRESH_TOKEN` to reduce unauthenticated sync DoS/cost risk.
- Added `/api/catalog/status` plus `pnpm catalog:sync` and `pnpm catalog:sync:dry` so catalog freshness and sync health are inspectable without opening SQLite by hand.
- Added a registry timeout test and re-ran smoke E2E/edge-case/chaos checks against the live dev server and registry service.
- Switched registry persistence from one-row-at-a-time upserts to batched upserts.
- Added item-level freshness/source metadata to catalog rows: `sourceName`, `sourceUrl`, `firstSeenAt`, `lastSeenAt`, and `lastSyncedAt`.
- Verified a live sync persisted `24630` rows with those freshness fields populated, and `/api/catalog/status` now reports both `latestCatalogItemAt` and `latestCatalogSyncAt`.
- Added derived trust scoring in the web catalog so items now show `Verified`, `Official`, or `Community` alongside freshness labels.
- Simplified catalog freshness ordering away from raw `coalesce(...)` SQL snippets after an intermittent dev-console query generation error.
