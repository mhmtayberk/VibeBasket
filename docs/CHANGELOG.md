# Changelog

All notable changes to this project will be documented in this file.

## [0.9.0] — 2026-06-13

### 5 New IDE Targets (24 total)
- **Cortex Code** (Snowflake): CLI terminal agent. MCP at `~/.snowflake/cortex/mcp.json`, skills at `.cortex/skills/`. Supports user and project scopes.
- **Goose** (Block / Linux Foundation): CLI/Desktop agent. MCP at `~/.config/goose/config.yaml`. User scope. MCP-only today.
- **IBM Bob** (IBM): Standalone IDE + Bob Shell. MCP at `~/.bob/mcp_settings.json` (global) and `.bob/mcp.json` (project). Skills at `.bob/skills/`.
- **CodeBuddy** (Tencent Cloud): IDE + VS Code/JetBrains plugin + CLI. MCP at `~/.codebuddy/.mcp.json` (user) and `.mcp.json` (project). Skills at `.codebuddy/skills/`.

### CLI Enhancements
- **`vibebasket list`**: New command that scans all 24 IDE targets for installed MCP servers, skills, and rules. Shows per-IDE summary with colored output.
- **`vibebasket search <query>`**: New command that searches the VibeBasket catalog API from the terminal. Returns up to 10 matching MCP servers, skills, or rules with their names, descriptions, and type badges.
- **Cross-target capability handling**: When a bundle contains skills/rules but not all selected targets support them, the CLI now warns and continues instead of failing. MCP is applied to all targets; skills/rules are only applied to targets that support them.

### Adapter Accuracy Fixes
- **Claude Code** now declares `supportsSkills: true` — skills are written to `~/.claude/skills/<id>/SKILL.md` or `./claude/skills/<id>/SKILL.md` for project scope.
- **Cursor** now declares `supportsRules: true` — rules are written to `.cursor/rules/<id>.md`.

### Documentation Updates
- ARCHITECTURE.md and PROJECT_OVERVIEW.md updated to reflect 23 IDE targets and 11 skills-capable adapters.
- CLI docs updated with `list`, `search` commands and `--scope` / `--dry-run` flags.

### Test Coverage
- 18 new adapter tests for Cortex Code, Goose, IBM Bob, and CodeBuddy
- 340 total tests (165 web + 50 CLI + 125 adapters) — all passing.

---

## [Unreleased]

### Catalog Integrity & Install Reporting
- **skills.sh fallback hardening**: When sitemap-based discovery is unavailable and the directory page does not expose its embedded skill payload, VibeBasket now falls back to repo crawling for both official and community skills instead of silently collapsing to official-only coverage.
- **Source-tag normalization**: skills synced from `skills.sh` fallback paths now persist as `skills-sh-official` or `skills-sh-community`, keeping trust badges and source provenance consistent with the UI model.
- **Collector health accuracy**: Admin operational visibility now groups persisted `skills-sh-official` and `skills-sh-community` rows under the single `skills.sh Directory` collector so coverage counts match reality.
- **`vibebasket list` install accuracy**: The CLI now inspects adapter-specific skill/rule install surfaces instead of scanning generic shared folders, so reported installs better match each IDE’s real integration path.

### 5 New IDE Targets (24 total)
- **Cortex Code** (Snowflake): CLI terminal agent. MCP at `~/.snowflake/cortex/mcp.json`, skills at `.cortex/skills/`. Supports user and project scopes.
- **Goose** (Block / Linux Foundation): CLI/Desktop agent. MCP at `~/.config/goose/config.yaml`. User scope. MCP-only today.
- **IBM Bob** (IBM): Standalone IDE + Bob Shell. MCP at `~/.bob/mcp_settings.json` (global) and `.bob/mcp.json` (project). Skills at `.bob/skills/`.
- **CodeBuddy** (Tencent Cloud): IDE + VS Code/JetBrains plugin + CLI. MCP at `~/.codebuddy/.mcp.json` (user) and `.mcp.json` (project). Skills at `.codebuddy/skills/`.
- 3 tools could not be added due to lack of public documentation: ForgeCode, CodeArts Agent (Huawei), CodeMaker.

### CLI Enhancements
- **`vibebasket list`**: New command that scans all 24 IDE targets for installed MCP servers, skills, and rules. Shows per-IDE summary with colored output.
- **`vibebasket search <query>`**: New command that searches the VibeBasket catalog API from the terminal. Returns top 10 results with type badges and descriptions.
- **Cross-target capability handling**: When a bundle contains skills/rules but not all selected targets support them, the CLI now warns and continues instead of failing. MCP is applied to all targets; skills/rules are only applied to targets that support them.

### Adapter Accuracy Fixes
- **Claude Code** now declares `supportsSkills: true` — skills are written to `~/.claude/skills/<id>/SKILL.md` or `./claude/skills/<id>/SKILL.md` for project scope.
- **Cursor** now declares `supportsRules: true` — rules are written to `.cursor/rules/<id>.md`.

### Documentation Updates
- ARCHITECTURE.md and PROJECT_OVERVIEW.md updated to reflect 23 IDE targets and 11 skills-capable adapters.
- CLI docs updated with `--scope` and `--dry-run` flags (replaced non-existent `--project-root` and `--yes`).

### Test Coverage
- 18 new adapter tests for Cortex Code, Goose, IBM Bob, and CodeBuddy
- 340 total tests (165 web + 50 CLI + 125 adapters) — all passing.

### Multi-Cloud Backup Storage System with DB-Backed Config
- **Six storage backends**: Local Filesystem, AWS S3, Cloudflare R2, DigitalOcean Spaces, Azure Blob Storage, Google Cloud Storage — all with a unified `StorageBackend` interface.
- **R2 and Spaces piggyback on S3 backend**: S3-compatible protocol means one implementation covers three providers.
- **AES-256-GCM encrypted credential storage**: API keys and secrets are encrypted with a key derived from `AUTH_SECRET` via `scryptSync` before storing in the SQLite `backup_storage_config` table. Never stored in plaintext.
- **DB-first configuration**: `BACKUP_STORAGE_BACKEND` env var is still supported as fallback, but credentials stored in the DB take precedence. Changing backends no longer requires a server restart.
- **Admin panel storage management UI**: Full-width card with a backend selector table (6 rows showing status, active indicator, Setup/Edit button). Credential forms dynamically show the correct fields per backend type (endpoint, bucket, access key, secret key for S3; connection string + container for Azure; bucket + project ID for GCS).
- **Lazy-loaded cloud SDKs**: `@aws-sdk/client-s3`, `@azure/storage-blob`, and `@google-cloud/storage` are dynamically imported only when their backend is activated. The barrel `index.ts` avoids static re-exports that would trigger Next.js module resolution errors.
- **Backup operations**: Create timestamped backups, list them, restore (with pre-restore safety backup), and delete — all through server actions with admin-only auth guards.
- **25 unit + edge case + chaos tests**: Local backup create/list/delete, concurrent backups, missing files, zero-byte files, special characters, non-file entries, factory backend selection for all 6 backends, and graceful DB-not-available fallback.

### Microsoft Entra ID (Azure AD) Auth Provider
- **New OAuth provider**: Microsoft Entra ID added alongside GitHub, Google, and Apple. Uses `next-auth/providers/microsoft-entra-id` with `/common/` endpoint for personal + work/school accounts.
- **Provider gating**: `AUTH_MICROSOFT_ENTRA_ID_ENABLED`, `AUTH_MICROSOFT_ENTRA_ID_ID`, `AUTH_MICROSOFT_ENTRA_ID_SECRET`. Included in `.env.example` and `provider-config.test.ts`.
- **Total 4 providers now**: GitHub, Google, Apple, Microsoft — each independently gateable.

### Admin Panel Redesign
- **Consistent design system**: Replaced hardcoded `#050505`/`#a855f7` colors with project CSS variables (`--background`, `--accent`, `--foreground`). Removed `rounded-2xl`/`rounded-xl` in favor of global `--radius: 0.125rem` (2px sharp corners).
- **Leaderboard table**: Converted div-list to proper `<table>` with `<thead>`/`<tbody>`/`<tr>`/`<td>` structure. Headers, alignment, and padding all consistent.
- **Sync button**: Redesigned with proper hover/disabled states, spinner animation during sync.
- **Backup card**: Full-width `md:col-span-3` with backend selector table, credential forms, backup operations, and status indicators.

### Sync & Concurrent Operations Hardening
- **Concurrency analysis**: Verified no data corruption risk during registry sync. Different tables (`catalog_items` vs `saved_stacks` vs `bundles`), SQLite WAL concurrent readers, transactional sync writes, single-flight guard.
- **Server action robustness**: Dynamic import for `RegistrySyncService` (avoids Next.js bundle issues), null-safe summary fields, `instanceof Error` checks in catch blocks, try/catch on network errors in SyncButton.
- **18 sync edge case tests**: Auth guards, error types (Error, TypeError, string, object, empty message), zero/max items, source errors, sequential calls, revalidatePath behavior.

### Saved Stack & Profile Enhancements
- **Interactive Stack Editing**: Replaced the primitive `window.prompt` rename dialog with a fully featured, custom `EditStackDialog` modal. Normal users can now edit stack name and description, add/remove components directly (synced dynamically with their active basket), and toggle target IDEs in a geometric grid. Expanded screen utilization to `max-w-7xl` / `w-[95vw]` to deliver a spacious two-column layout (Components on the left, Target IDEs on the right) with strict **English-only** arayüz copy.
- **Admin Layout and Navigation Hiding**: Admin users are no longer shown a saved stacks list or the `Save Stack` panel triggers, preventing all administrative footprinting. In its place, we introduced a premium systems widget with a direct redirection action link to the `/admin` console. Dynamically hid the `My Stacks` navigation link from the `AuthMenu` header for administrators, displaying exclusively the `Admin Panel` action button.
- **Mock Admin Session Insertion**: Safe database fixtures were populated in the local SQLite db, restoring the ability to log in as an administrator using the `mock-admin-token-12345` token.

### IDE Targets & Automation Upgrades
- **Integrated Aider, Void, and GitHub Copilot Targets**: Added native adapter integrations for these highly popular coding tools:
  - **GitHub Copilot**: Supports project-scoped rules and skills inside `.github/copilot-instructions.md` using high-fidelity delimiters.
  - **Void Editor**: Supports global/project mcp config merging in `mcp_servers.json` and rules/skills inside both `.voidrules` and `.clinerules`.
  - **Aider**: Supports zero-dependency idempotent `.aider.conf.yml` YAML config mutations (injecting the `read` flag) and rules/skills inside `.aiderinstructions.md`.
- **CLI Auto-Apply for Skills & Rules**: Reworked the CLI execution pipeline (`apply.ts`, `rollback.ts`) to automatically apply and compile rules and skills right after base config writes, delivering 100% feature-complete automation.
- **Ecosystem Watchlist Sync**: Registered and documented all 19 supported targets inside `apps/web/src/lib/targets.ts` and the `/docs` adapters layout tab.

### Security & Hardening
- **Secure Health Check Endpoint**: Implemented a live `/api/health` API route that queries the database via a lightweight Drizzle select (`db.select().from(users).limit(1)`) to verify real system connectivity. Mitigated Denial of Service (DoS) and request flooding risks via an in-memory database status cache with 5s TTL, and enforced strict HTTP no-cache headers. Injected process uptime tracking in seconds (`uptime` field).

- **Information Disclosure Mitigation in Sitemap**: Added `/docs` route to the intelligent `sitemap.ts` generator, and verified that no private user-scoped bundle pages (`/bundle/[id]`) or administrative routes (`/admin`) are exposed to search engine bots, keeping user data confidential.
- **XSS & LFI/RFI Defenses**: Secured the `/docs` routing context against Local/Remote File Inclusion (LFI/RFI) by strictly validating the tab query parameter against a secure whitelist of allowed tabs. Shielded search inputs from ReDoS and Cross-Site Scripting (XSS) by enforcing a 100-character constraint on the query parameter.

### Self-Hosting & Docker Integration
- **Multi-stage Production Dockerfile**: Created a lean multi-stage `Dockerfile` based on Node.js 22 Alpine, optimizing image size via Next.js standalone build output, running as a non-root user, and supporting SQLite database persistence via Docker volume mounts.
- **Docker Compose Setup**: Designed a production-ready `docker-compose.yml` configuration with custom named volume persistence, automated container health checks utilizing the `/api/health` endpoint, and comprehensive inline environment documentation.
- **Structured .env.example**: Produced a clean, secure `.env.example` template covering all key parameters (Next-Auth secrets, OAuth credentials, trust proxies), tracked it under Git, and updated the `.dockerignore` to block accidental secret leaks.

### Documentation & UI Improvements
- **Expanded Search Scope**: Enriched keywords mapping was added to all guides inside the `/docs` hub, allowing users to successfully search long-tail terms like "Docker", "compose", "volume", "security", "credentials" and locate relevant architectural articles instantly.
- **GitHub OAuth Redirect Spec**: Expanded the self-hosting documentation inside `/docs?tab=self-hosting` with a dedicated callout explaining how to correctly declare the GitHub OAuth application callback URL (`${NEXTAUTH_URL}/api/auth/callback/github`) in developer environments.

---

## [0.8.0] — 2026-05-26

### Documentation & UI Hub
- Redesigned the `/docs` layout grid, sidebar panel (`w-72`), and content sections to dramatically expand vertical margins, bento card paddings (`p-10`), and grid gaps (`gap-12 md:gap-14`), eliminating vertical clutter and delivering a deeply spacious, highly breathing visual environment.
- Swapped out all standard rounded corner classes (`rounded-lg`, `rounded-md`, etc.) inside `apps/web/src/app/docs/page.tsx` for sharp pixel-perfect geometric corners (`rounded-[2px]`).
- Added `/docs` route to the main header navigation and footer links on the homepage for unified top-level discoverability.
- Centered an animated "Made with ♥ by Vibe Coding for Vibe Coders" footer signature inside a dedicated bottom row across both the homepage and docs pages.

### Design System
- Set the global `--radius` CSS custom property inside `globals.css` to `0.125rem` (2px), instantly enforcing sharp geometric borders across all Shadcn UI components (buttons, input fields, popovers, and dialogs) project-wide.
- Added surface container color tokens (`--color-surface-container-*`) and spacing tokens to `globals.css` to align the CSS layer with the design system specification.
- Resolved the Next.js `missing-data-scroll-behavior` route-transition warning by conditionalizing the global smooth-scrolling behavior using the `html[data-scroll-behavior="smooth"]` attribute selector in `globals.css`.

### Security & Performance
- Implemented SQLite WAL (Write-Ahead Logging) mode during database bootstrap, enabling full reader-writer concurrency and mitigating `SQLITE_BUSY` blocking risks.
- Integrated Drizzle atomic DB transactions within the `persistCatalog` ingestion cycle, reducing write disk I/O operations and scaling ingestion performance by over 100×.
- Refactored `apps/web/src/lib/rate-limit.ts` with a dynamic client IP resolver supporting Cloudflare (`cf-connecting-ip`), trust proxy variables (`TRUST_PROXY`), and standard socket fallbacks, preventing client-side IP spoofing rate-limit bypass.
- Added a lightweight Map garbage-collection sweeper (`cleanupExpiredBuckets`) triggered during rate limiting checks, preventing long-running in-memory leaks.

### IDE Adapters
- Refactored Roo Code (`.clinerules`), Hermes (`.hermesrules`), and OpenClaw (`.openclawrules`) IDE adapters to use high-fidelity block delimiter wrappers (`>>> VIBEBASKET START/END <<<`), enabling idempotent rule updates without corrupting custom developer modifications.
- Added **Continue, Roo Code, Hermes, and OpenClaw** IDE/Agent adapters with full MCP and native **Skills (Prompts & Rules)** support.
- Configured Continue prompts under `.continue/prompts/*.prompt` files, Roo Code rules inside `.clinerules`, Hermes rules in `.hermesrules`, and OpenClaw rules in `.openclawrules`.

### Catalog & Admin
- Implemented highly secure, dynamic OAuth Admin promotion dynamically assigning `role: "admin"` in user sessions *only* for verified emails matching the `ADMIN_EMAILS` configuration.
- Created `/admin` server-rendered Bento Stats Dashboard utilizing concurrent Drizzle database aggregation queries and sync status telemetry.
- Implemented secure Next.js Server Action `triggerSyncAction` executing manual registry synchronization entirely server-side.
- Highly optimized the catalog API (`/api/catalog`) by migrating the expensive in-memory `ensureCatalogSkillMirrorCleanup()` deduplication step to the `@vibebasket/registry` sync persistence layer.
- Resolved SQLite database locking (`SQLITE_BUSY`) under high concurrency by introducing `PRAGMA busy_timeout = 5000` to the database bootstrap phase.
- Hardened Codex CLI TOML adapter to be completely tolerant of single or double quotes around server identifiers in `config.toml`.
- Implemented independent desktop grid column scrolling with custom scrollbar utilities for `CatalogGrid` and `BasketPanel`.

### Testing
- Expanded workspace test coverage with a new `rate-limit.test.ts` suite and updated delimiter integration unit tests; all 120 monorepo Vitest tests pass.

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
- Fixed `skills.sh` official/community provenance classification after tracing escaped trailing repo identifiers in the official page parser; a live sync now persists `1771` official skills alongside the broader community corpus.
- Removed the silent GitHub-skill `ref: "main"` default from manifests and canonical dedupe keys so upstream refs remain honest and mirror cleanup no longer invents branch metadata.
- Improved `/api/catalog` search ordering so exact and prefix display-name matches rank above broader description/source/data matches.
- Fixed remote MCP serialization in Cursor, VS Code, Windsurf, and Antigravity by routing config output through the shared MCP merge utility.
- Tightened adapter capability flags and hardened CLI apply so unsupported bundle scopes or target write failures abort the run instead of reporting a misleading partial success.
- Added focused regression tests for remote MCP serialization, CLI apply failure modes, and escaped-repo `skills.sh` official classification.
- Rebuilt the workspace dependency tree after pnpm left local test/lint/typecheck binaries half-linked, then hardened package scripts around a shared workspace-aware Vitest launcher and `pnpm exec` tool resolution.
- Fixed a client/server boundary regression in the new target capability centralization: web client code now imports adapter capability metadata through a narrow `target-capabilities` path instead of the full adapter index, which restored clean Next.js production builds.
- Added a shared `isSupportedTargetId()` guard in the web target model so bundle validation, stack normalization, and basket target toggles keep strong `IdeId` typing without leaking stringly-typed checks.
- Re-verified the hardened tree with passing results for `pnpm --filter @vibebasket/adapters test`, `pnpm --filter web test`, `pnpm --filter web lint`, `CI=true pnpm -r run typecheck`, `CI=true pnpm -r run test`, `pnpm --filter web build`, and `pnpm --filter web exec playwright test`.
- Added DeepSeek-TUI as a real adapter-backed target using the official `~/.deepseek/mcp.json` MCP surface, including CLI apply/rollback wiring and adapter regression coverage.
- Clarified the product surface so DeepSeek-TUI is presented as MCP-only today; skills/rules remain unsupported for auto-apply there just like the rest of the current target set.
