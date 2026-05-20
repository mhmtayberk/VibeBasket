# Active Context

## Current State
- The main current focus is the catalog system, especially trusted-source ingestion, browseability, and operational cost.
- Catalog loading bugs have been addressed.
- Trusted-source sync is now live instead of mostly stubbed.
- The web catalog now supports explicit pagination and visible toggle selection.
- The homepage and builder UI are being shifted toward a Stitch-inspired technical-editorial design system.
- The newest UI pass is focused on micro-polish rather than large structural changes: tighter headline scale, marquee-style target motion, softer fragmented background texture, and less runaway basket height.
- The supported adapter set is no longer limited to the original four editors; it now covers Claude Code, Zed, Gemini CLI, Junie, Kiro, and Cline CLI as well.
- Codex CLI is now adapter-backed too, and the visible target list has been narrowed back to the real supported set.
- The current local DB contains thousands of MCP and skill records rather than only a tiny seed set.
- Full workspace verification is green again after fixing package manifest gaps, Tailwind plugin resolution, and a few exact-optional TypeScript errors.
- The catalog API no longer blocks the first empty-state request on a full upstream sync; it now seeds verified items first and lets the heavier registry refresh continue in the background.
- The background sync is now scheduled after the request path rather than started inline before the response query, which reduces SQLite lock contention during first load.
- The homepage now server-renders the first MCP catalog page from SQLite and passes it to `CatalogGrid`; this is the primary guard against the recurring infinite `Loading catalog` state when browser-side hydration or the first API fetch misbehaves.
- Live-source audit found and fixed an ID-collision bug where official MCP variants overwrote each other in SQLite; the current DB has `24534` rows and `24534` distinct IDs after full sync.
- Production force-refresh is now token-gated to avoid exposing an unauthenticated expensive registry sync endpoint.
- The system now records sync audit rows and exposes them through `/api/catalog/status`; manual `pnpm catalog:sync` is the intended operator path for cron-style refreshes.
- Surface testing now covers three layers: live dev-server E2E smoke, API edge-case smoke, and registry chaos/timeout behavior.
- Batched persistence is now in place for registry writes, and catalog rows now store source/freshness metadata directly.
- Trust scoring is now derived in the web layer from `verified + source + freshness`, with visible `Verified`, `Official`, and `Community` badges on catalog items.

## Next Steps
- Optimize registry persistence with batch/transaction-based writes; full sync is functionally correct but still heavier than ideal.
- Revisit catalog search strategy once `LIKE` stops being enough.
- Continue product audit across responsive polish, SEO, and installer feature parity for non-MCP item types.
- Keep the target list current against the fast-moving AI editor ecosystem, but do not expose a target in the UI until there is a real adapter-backed apply path.
- Verify the redesigned homepage across more real browser/device combinations once a reliable automated screenshot path is available.
- Keep full-workspace verification green after dependency or registry-ingestion changes; lockfile drift is now a concrete operational risk to watch.
- If we later want to publish packages outside the monorepo, we should revisit declaration emission instead of relying on source-entry `types` fields.
- If catalog scale keeps growing, the next backend improvement should be batched persistence rather than one-row-at-a-time upserts.
- Partial upstream failures should never shrink the catalog surface; prune-on-sync is now tied to fully healthy collector runs only.
- The next registry performance fix should target persistence speed: full live sync is correct but still takes about a minute because rows are upserted one at a time.
- The next likely catalog-data improvement after this is trust scoring, because the underlying per-item freshness/source model now exists.
- The next likely trust-related improvement after this is making the score consumable in filtering/sorting once we see how the current badges perform.

## Considerations
- **Immutability:** Bundles are stored as full manifests, ensuring they don't break if the catalog changes.
- **Security:** CLI fetches the bundle and prompts for secrets locally.
- **Resilience over purity:** if one upstream source fails, catalog sync should still serve healthy cached or partial trusted data.
- **Performance matters now:** catalog scale is already large enough that pagination, indexing, and sync dedupe are part of the core product, not polish.

## Recent Changes
- Fixed DB path resolution to avoid `cwd`-dependent catalog failures.
- Fixed dev origin issues that caused the catalog UI to appear stuck when opened via local network IPs.
- Reworked registry sync to ingest the official MCP Registry and public official `skills.sh` source.
- Added source error reporting to registry sync summaries.
- Fixed basket selection reactivity so items can be selected and unselected correctly.
- Added API-level pagination metadata and UI-level page navigation.
- Added runtime index creation for the main catalog query paths.
- Refreshed the homepage, builder surface, and basket UI around a darker grid-visible, Geist-based design language inspired by the Stitch reference.
- Changed stale catalog sync behavior so normal catalog reads no longer block on a full upstream refresh.
- Reduced the hero headline scale and converted the target row into a marquee-like motion surface.
- Added a slightly more fragmented global noise treatment without introducing heavy visual effects.
- Prevented the basket panel from turning into an endless wall by summarizing counts and collapsing long selections behind an explicit expand control.
- Removed target abbreviations from the basket UI and switched the supported target grid to full product names.
- Fixed the CLI apply flow so `project` scope adapters finally receive `projectRoot` at runtime instead of throwing on missing path context.
- Removed `Trae` from the visible target surface and returned the homepage target rail to a sliding icon marquee.
- Refreshed the lockfile and restored the ability to run workspace-wide verification after the registry package dependency change.
- Fixed missing workspace dependencies and package metadata issues that had broken `pnpm -r run build` and `pnpm -r run typecheck`.
- Hardened the first-load catalog experience by switching from blocking full sync to verified bootstrap + background sync.
- Added canonical metadata and JSON-LD to the homepage so the public marketing surface is in better SEO shape.
- Added upstream fetch timeouts and changed partial-failure persistence rules so flaky sources do not stall or shrink the catalog.
- Added a server-side initial catalog snapshot and confirmed Firefox renders the first page (`Showing 1-24 of 8344`) after reload.
- Fixed official MCP and skills.sh duplicate-ID handling, then verified live sync persisted `19607` MCP rows and `4925` skill rows with zero canonical duplicates.
- Added production protection for forced catalog refresh requests.
- Added batched upserts plus per-item freshness/source metadata, then verified a later live sync persisted `24630` rows with freshness fields populated and status telemetry still healthy.
- Added derived trust badges in the catalog UI and simplified freshness ordering in the API routes to avoid intermittent raw-SQL dev errors.
