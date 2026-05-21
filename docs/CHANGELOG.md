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
- Added trust-aware discovery controls and API query params for `trust`, `freshness`, and `sort`, so trust metadata now influences browse results instead of staying display-only.
- Added `apps/web` test and typecheck scripts, then verified the new catalog discovery helpers with Vitest under the workspace test path.
- Added a quiet fallback basket storage adapter for non-browser contexts to remove missing-`localStorage` warnings from tests and SSR.
- Collapsed the catalog filter controls behind a compact disclosure button with active-filter summary pills so the builder stays cleaner by default without hiding current discovery state.
- Removed visible sync-recency badges from catalog cards, keeping trust focused on `Verified`, `Official`, `Community`, and source provenance.
- Defaulted the basket target picker to `Claude Code` only and alphabetized the supported target list.
- Added successful-sync cleanup for legacy null-source catalog rows, then verified live sync now leaves `0` `source_name is null` records in SQLite.

### Recent auth and saved-stack work

- Added Auth.js plus the Drizzle adapter to `apps/web`, using DB-backed sessions against the shared `@vibebasket/core` tables.
- Added provider gating for GitHub, Google, and Apple via `AUTH_*_ENABLED`, `AUTH_*_ID`, and `AUTH_*_SECRET`, so self-hosted deployments can expose only the providers they actually configure.
- Added a live `/api/auth/[...nextauth]` route, server-side session helpers, and a signed-in header/account surface on the homepage.
- Added a sign-in dialog that only renders enabled providers and links users into the authenticated flow without weakening anonymous catalog browsing.
- Added the first authenticated saved-stack API surface: `GET/POST /api/stacks` plus `GET/PATCH/DELETE /api/stacks/[id]`.
- Added stack validation helpers and tests for provider gating and stack payload normalization.
- Hardened auth/saved-stack SQLite upgrades so existing tables are rebuilt transactionally, duplicate legacy auth data fails with explicit messages, and foreign-key enforcement is restored cleanly after migration errors.
- Removed the visible `Auth disabled` fallback from the homepage header so the auth surface now disappears cleanly when no provider is configured.
- Fixed production-build SQLite lock contention by ensuring auth-table bootstrap writes happen in the auth route path instead of at module import time.
- Wired the basket UI into saved-stack flows with save/load/delete/rename controls and a shared saved-stack panel on both the basket and `/stacks` page.
- Audited the catalog for duplicate skills and character corruption: the live DB currently shows `0` exact duplicate GitHub skill sources (`repo + path + ref`) and `0` obvious mojibake/control-character display-name issues.
- Tightened GitHub skill canonical identity from `repo + basename(path)` to `repo + full path + ref`, closing a false-merge edge case for nested skill paths.
- Normalized catalog display text on ingest by stripping control/zero-width characters, normalizing Unicode, and collapsing whitespace before catalog items are stored or rendered.
- Added source provenance hints to catalog cards so same-named skills are easier to distinguish without unsafe title-based deduplication.
- Added mirror-aware official skill dedupe so repo-family variants like `*-plugins` no longer appear twice when they expose the same owner/path skill.
- Added a one-shot catalog hygiene cleanup on the web API path to remove already-persisted official skill mirror duplicates from SQLite before the next healthy full sync.
- Tuned MCP registry fetch behavior to use a longer dedicated timeout window than the generic source fetch path, and stopped logging background partial-sync source errors on normal catalog requests.
- Simplified trust scoring so it now reflects source provenance only instead of blending sync timing into the score.
- Added flatter brand-style target icons to the hero marquee, plus a fixed back-to-top button for long catalog sessions.
- Hardened CLI apply honesty by flattening workflow-pack content before apply and aborting when selected targets cannot actually install bundled skills, rules, or workflow files yet.
- Corrected Cursor's user-scope MCP config target to `~/.cursor/mcp.json`.
- Broadened `skills.sh` ingestion beyond the official page by parsing the public directory surface, while preserving official/community provenance and mirror-aware dedupe.
- Added live `skills.sh` query enrichment for skill searches in `/api/catalog`, so long-tail searches such as `postgresql` can surface far more community skills without requiring a full-corpus crawl on every sync.
- Replaced missing/faint marquee icons with downloaded public agent SVGs for supported targets like Cursor, Windsurf, VS Code, Antigravity, Claude Code, Codex, Gemini, Cline, and Kiro.
- Hardened Auth.js host trust for self-hosted production deployments by requiring explicit `AUTH_TRUST_HOST` instead of always trusting forwarded host headers.
- Hardened bundle creation against body-size bypasses by enforcing the 100KB limit on the actual request payload, not only the `Content-Length` header.
- Removed the broken `skills.sh/?q=...` enrichment path after verifying it returned broad leaderboard/global data rather than reliably filtered search results.
- Switched skills sync to the public `skills.sh` sitemap index and skill sitemaps, which now ingest the full published skills corpus instead of a small homepage subset.
- Expanded local skill search matching to include `sourceUrl` and raw stored `data`, improving repo/path-based queries like `postgresql`.
- Fixed large-catalog SQLite pruning by replacing a single huge `NOT IN (...)` delete with chunked stale-row deletes under the parameter limit.
- Verified a live persisted sync now completes successfully with `20827` MCPs, `19932` skills, `1` rule, `1` workflow, and `0` source errors (`40761` total rows).
- Added bundle route tests and hardened `/api/bundle` around typed manifest partitioning, missing-item rejection, unsupported-target validation, and real-byte payload limits.
- Cleaned low-risk code-quality debt across CLI and web surfaces by removing a dead mock catalog file, centralizing auth-required JSON responses, simplifying basket state, and replacing several `any`/non-null shortcuts with explicit typed helpers.
- Added a lightweight Playwright E2E harness for the homepage/catalog smoke path and verified two browser flows against a live local dev server.
- Re-validated the app with live smoke timings: homepage around `0.98s`, first-page catalog API around `54ms`, and catalog status around `184ms`.
- Fixed local verification drift by correcting the shared `ignoreDeprecations` setting and refreshing missing dependencies needed for `next`, `next-auth`, Playwright, and Vitest-based checks on this machine.
- Added a shared workspace-root Vitest launcher (`scripts/run-vitest.mjs`) and repointed package test scripts to it, eliminating package-local pnpm/Vitest resolution drift during recursive test runs.
- Added an explicit `apps/web` Vitest config so browser E2E files and `node_modules` fixture tests no longer leak into the unit-test suite.
- Dropped the Google-hosted Geist font dependency from the app shell, which makes local and CI production builds deterministic without network font fetches.
- Hardened the Playwright harness to run against an isolated production-like `next start` server with its own test-only auth env, avoiding collisions with an already-running local dev server.
- Re-verified the full workspace after those changes: `CI=true pnpm -r run typecheck`, `CI=true pnpm -r run test`, `pnpm --filter web lint`, `pnpm --filter web test`, `npx next build`, and `npx playwright test` all pass.
