# Active Context

## Current State
- The main current focus is the catalog system, especially trusted-source ingestion, browseability, and operational cost.
- Catalog loading bugs have been addressed.
- Trusted-source sync is now live instead of mostly stubbed.
- The web catalog now supports explicit pagination and visible toggle selection.
- The homepage and builder UI are being shifted toward a Stitch-inspired technical-editorial design system.
- The newest UI pass is focused on micro-polish rather than large structural changes: tighter headline scale, marquee-style target motion, softer fragmented background texture, and less runaway basket height.
- The target picker now has a second concern beyond adapter support: it should represent the popular AI IDE landscape accurately while keeping unsupported targets visibly non-installable.
- The supported adapter set is no longer limited to the original four editors; it now covers Claude Code, Zed, Gemini CLI, Junie, Kiro, and Cline CLI as well.
- Codex CLI is now adapter-backed too; Trae remains the only visible target still waiting on a verifiable official config surface.
- The current local DB contains thousands of MCP and skill records rather than only a tiny seed set.

## Next Steps
- Optimize registry persistence with batch/transaction-based writes; full sync is functionally correct but still heavier than ideal.
- Revisit catalog search strategy once `LIKE` stops being enough.
- Continue product audit across responsive polish, SEO, and installer feature parity for non-MCP item types.
- Add real adapters for roadmap targets before moving them from "coming soon" to installable bundle targets.
- Keep the target watchlist current against the fast-moving AI editor ecosystem; visible names should be sourced from official docs/sites and re-checked periodically.
- Verify the redesigned homepage across more real browser/device combinations once a reliable automated screenshot path is available.

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
- Made target visibility more honest by listing supported and roadmap AI IDEs while the bundle API still rejects unsupported targets.
- Prevented the basket panel from turning into an endless wall by summarizing counts and collapsing long selections behind an explicit expand control.
- Split the target surface into "works today" and a scrollable ecosystem watchlist so more popular AI IDEs fit without bloating the basket panel.
- Removed target abbreviations from the basket UI and switched the supported target grid to full product names.
- Fixed the CLI apply flow so `project` scope adapters finally receive `projectRoot` at runtime instead of throwing on missing path context.
