# Active Context (June 21, 2026)

## Current State

- **24 IDE Adapters**: 16 extended from BaseAdapter (code reduced 49%). 8 kept with custom logic. Zero tests broken.

- **Registry Split**: 1346-line monolith → 6 modules. Clean imports, no logic changes.

- **Docs Split**: 1022-line page.tsx → 368-line shell + 7 tab components. Zero errors.

- **Drizzle Kit**: Migration system configured. Existing bootstrap kept as fallback. PRAGMA auto_vacuum + mmap_size added.

- **DB Quality**: cleanupStaleData() runs hourly — sessions, verification_tokens, sync_runs (200 retention), expired registered bundles (365d), incremental_vacuum.

- **Shared UI**: Chip (4 variants), MonoLabel — available for new code.

- **Test Coverage**: Focused suites for web/admin, adapters, and CLI install verification are passing. Web TypeScript typecheck is clean.

- **Security**: next.config.ts global headers + CSP (production). 8 endpoints rate-limited (sliding window). SameSite CSRF.
- **Security Honesty Pass**: README, SECURITY.md, docs security tab, and llms.txt now match the real product surface instead of overstating catalog size or claiming the web tier never stores any encrypted admin credentials.
- **Proxy Trust Hardening**: `cf-connecting-ip` is no longer trusted unless `TRUST_PROXY` is explicitly enabled, closing a quiet rate-limit spoofing footgun for direct-origin deployments.
- **Header Hardening**: Production headers now include HSTS, `X-Permitted-Cross-Domain-Policies`, `X-Download-Options`, and a stricter CSP that avoids `script-src 'unsafe-inline'`.
- **Install Correctness**: CLI apply now supports post-install verification, and adapter capability metadata is being kept aligned with real adapter behavior.
- **Adapter Drift Fixes**: Codex CLI project scope and Codex-native remote HTTP header fields are now treated as first-class adapter requirements. Gemini CLI is now tracked as a real skills-capable target via `.gemini/skills`.
- **Registry Secret Preservation**: Official MCP registry sync now preserves package environment-variable prompts and remote header-based auth prompts, so hosted catalog metadata survives into CLI apply without the web app collecting runtime secrets.
- **Capability-Aware Apply**: CLI now skips unsupported content per target instead of pretending to apply it; MCP-unsupported targets no longer perform no-op config writes.
- **Catalog Integrity**: `skills.sh` sync now preserves community skills during sitemap/directory fallback, and official/community source tags are normalized for trust badges and health reporting.
- **Cross-Collector Skill Dedupe**: GitHub-backed skill mirrors are now collapsed across `verified.yaml` and `skills.sh` collectors, so the UI prefers verified records and stops surfacing mirror duplicates as separate cards.
- **CLI Inventory Accuracy**: `vibebasket list` now inspects adapter-specific skill/rule install surfaces instead of generic shared paths.
- **Release Automation**: GitHub Actions CI, CodeQL, Dependabot, PR template, and a production readiness checklist are being added to support public launch and self-hosted production use.
- **Pre-Prod Audit**: Repo-wide Biome lint is green again, package builds pass, and focused registry/adapters/core/web test surfaces have been re-verified during prod-readiness hardening.
- **Migration Safety**: Legacy `catalog_items` upgrades now backfill missing `description`/`icon` columns before FTS bootstrap, and saved-stack target indexes are recreated during schema bootstrap.
- **Build Reality**: `pnpm --filter web build` now succeeds without the prior Turbopack NFT tracing warning after moving admin backup/readiness client calls onto route handlers.
- **Storage Visibility**: Admin backup UI can now surface when a configured cloud backend is incomplete and the runtime has fallen back to local storage.
- **Release Readiness**: Admin now computes deploy-time blockers/warnings for auth, proxy trust, OAuth provider completeness, refresh token, storage fallback, and SQLite backup compatibility.
- **Cloud Restore**: Backup restore now supports local plus provider-native cloud download paths for S3/R2/Spaces, Azure Blob, and GCS.
- **Security Tightening**: Admin role promotion now requires a verified allowlisted email, proxy-derived IP headers are trusted only in `TRUST_PROXY` mode, stack mutations enforce same-origin checks, and bundle share URLs prefer configured public origin.
- **Stacks Route Contract**: Saved-stack reads no longer require a mutation `Origin` header, while `POST`/`PATCH`/`DELETE` continue to enforce same-origin CSRF checks. Targeted stack route tests were updated to reflect real browser mutation behavior.
- **Launch Surface Polish**: Public docs now use the real repository clone URL, self-hosting guidance references the in-repo Helm chart instead of an unverified external chart repo, and contributor/LLM-facing docs were trimmed of stale claims.
- **Typecheck Reality**: `packages/registry` now has a dedicated cross-package typecheck config, the adapter test fixtures were aligned with stricter MCP metadata requirements, and the full workspace currently passes `pnpm typecheck`.
- **Launch Gate Reality**: `pnpm verify:ci` now includes the full workspace typecheck, and GitHub Actions is aligned to `pnpm@11.7.0` so local and CI verification use the same declared package-manager family.
- **Registry Sync Controls**: Operators can now tune `CATALOG_FETCH_RETRIES` and `CATALOG_MCP_REGISTRY_TIMEOUT_MS`, and use `pnpm catalog:sync:strict` to fail pre-launch checks when a trusted upstream source still errors out.
- **Registry Sync Observability**: Manual sync commands now emit collector-level progress to stderr, sync summaries now carry per-source duration/item-count results, and `skills.sh` fetches have a separate timeout knob via `CATALOG_SKILLS_TIMEOUT_MS`.
- **Deploy Surface Alignment**: Docker Compose now exposes the full auth/catalog tuning surface, the Dockerfile pins pnpm to the repository-declared version, and the Helm chart now has a real generated Secret path via `secretEnv` plus `existingSecret` override support.
- **Infra Hardening Pass**: Root ignore rules now explicitly mark `memory-bank/` and `docs/superpowers/` as internal working docs for future accidental-add protection, Docker Compose drops Linux capabilities and enables `no-new-privileges`, and the Helm chart disables service-account token automount while adding `allowPrivilegeEscalation: false` plus `RuntimeDefault` seccomp.
- **CLI Apply Contract**: Bundle apply is now target-aware for MCP compatibility and secret prompting. Invalid remote MCP entries are skipped per target instead of poisoning the whole run, unsupported MCP targets no longer trigger needless secret prompts, and workflow-pack file scaffolds now actually write in project scope.
- **Final Audit Tightening**: The web basket now resolves install scope from the selected target set instead of always emitting `user` bundles, the bundle API rejects scope/target combinations that cannot actually apply, and the catalog UI now exposes workflow packs instead of leaving that supported item type unreachable.
- **CI/E2E Stability Pass**: Playwright specs now rely on the configured base URL instead of hardcoding `localhost:3000`, GitHub Actions smoke runs can reuse a prebuilt app, and the CLI terminal search now queries the full catalog rather than MCPs only.
- **Launch Docs**: README, SETUP, SECURITY, ARCHITECTURE, PROJECT_OVERVIEW, and `llms.txt` now better reflect live catalog variability, `AUTH_TRUST_HOST`, first-sync expectations, and backup-credential handling.
- **Self-Hosting Docs Parity**: The docs UI and Markdown docs now match the actual Helm contract: non-secret values under `env`, secrets under `secretEnv` or a user-managed Kubernetes Secret.
- **Public Launch Quality**: README and public docs now explain the intended single-node deployment model more directly, set clearer first-run expectations, and describe the CLI/install surface in more honest product language.
- **GitHub Front Door**: Root docs now split public entrypoints more cleanly: README stays product-first, and `SELF_HOSTING.md` provides a shorter self-hosting landing page without overloading the main repository intro.
- **Domain Move Hardening**: public base URL resolution no longer falls back to a hardcoded production domain, CSRF origin checks now reuse the same public-origin resolver, and registry sync user-agents now point at the repository URL instead of the hosted product domain.
- **E2E Harness**: Playwright now boots the app through a production-like standalone server path instead of `next start`; full browser E2E still requires local Playwright browser binaries to be installed on the machine running the suite.
- **Rollback Correctness**: CLI backup restore now passes the real project root into project-scoped adapter writes, so project-level rollbacks restore into the intended workspace instead of relying on user-scope path behavior.
- **Backup Metadata Accuracy**: CLI backup listing now parses timestamped filenames structurally instead of rewriting every dash, keeping restore inventory ordering and displayed backup times stable.
- **Admin Mutation Hardening**: Admin backup/storage route mutations now enforce same-origin checks in addition to admin role checks, and those route handlers are covered by targeted tests.
- **Scheduled Backup Reality**: Admin backup scheduling now actually executes on authenticated admin dashboard refreshes via the storage-config fetch path, then records `lastScheduledAt` only after a successful backup.
- **Health Bootstrap Safety**: `/api/health` now ensures the database schema exists before probing SQLite, avoiding false-unhealthy first-run responses on fresh deployments.
- **Timestamp Cleanup Correctness**: stale-session, verification-token, and bundle cleanup now compares timestamp-mode columns against `Date` values instead of raw epoch seconds.
- **Trust Freshness Visibility**: Catalog trust metadata now carries `lastSyncedAt` through to the UI so freshness callouts are based on real persisted sync timestamps instead of dead/null state.
- **Capability Messaging Honesty**: Docs adapter capability badges now distinguish MCP-only, Skills+Rules, and MCP+Skills+Rules targets explicitly rather than implying MCP support from a single boolean.
- **CLI Flag Clarity**: `--force` and `--no-verify` behavior is now documented consistently across README and in-app docs so operators understand the overwrite and verification tradeoffs before install.
- **Public URL Resolution**: Web metadata, robots, sitemap, and bundle URL generation now resolve the public base URL through one shared helper with validation and safe fallback order (`NEXTAUTH_URL` -> `NEXT_PUBLIC_SITE_URL` -> request origin -> environment default).
- **SEO/Privacy Alignment**: Authenticated `/stacks` surfaces are now treated as non-indexable, and sitemap/robots no longer advertise saved-stack pages as public SEO targets.
- **Adapter Path Hardening**: XDG-aware and Windows-roaming-aware helpers now back VS Code/Cline, Roo Code, Zed, Goose, and OpenCode path resolution instead of assuming default `~/.config` or `~/AppData/Roaming` layouts; Void now follows the upstream `~/.void-editor/mcp.json` user-home contract directly.
- **Sync Scheduling Honesty**: README and ops docs now state explicitly that stale catalog refresh is request-driven; deterministic recurring sync still comes from external scheduling around `pnpm catalog:sync`.
- **Vendor Adapter Parity**: Official docs review in the current pass exposed and fixed real drift in Continue, Kiro, Zed, and Windsurf. Continue now targets `config.yaml` with the documented `mcpServers` YAML list plus prompt references, Kiro/Zed now install skills into vendor-documented directories, and Windsurf is now modeled as MCP + Skills + Rules instead of MCP-only.
- **24-Adapter Verification Pass**: CLI config inspection now understands adapter-native MCP shapes (`mcpServers` arrays, `mcp`, `context_servers`, Goose `extensions`) and verifies Cursor, Continue, Gemini CLI, Kiro, Windsurf, Zed, Roo Code, and OpenCode skill/rule artifacts using their real install paths.
- **Void Scope Honesty**: Void MCP auto-apply is now constrained to the upstream user-scope `~/.void-editor/mcp.json` surface. Skills/rules are no longer advertised for Void until bundle scope can model per-feature scope differences safely.
- **npm Package Surface**: The public CLI package is now published as `vibebasket@0.9.3`, npm metadata points at `mhmtayberk/VibeBasket`, the package README now explains hosted vs self-hosted CLI usage more clearly, and the publish surface was re-verified through real `npx` execution rather than only local workspace runs.
- **Optional Keychain Hardening**: CLI secret resolution now treats `keytar` as optional at runtime. When native keychain support is unavailable, the package falls back to `process.env`, `.vibebasket.env`, and interactive prompts instead of crashing during `apply`.

## Architecture Notes
- **Next.js 16.2.9**: App Router, standalone output, production CSP.
- **DB-first config**: Storage credentials encrypted. Resolution: DB → env → local.
- **Lazy-loaded cloud SDKs**: Dynamic import prevents Next.js build errors.
- **BaseAdapter**: Shared readConfig, applyMcps, writeConfig, diff for 16/24 adapters.
- **Security headers**: next.config.ts async headers() applies globally. CSP production-only.
- **CSP Reality Check**: Current production CSP remains intentionally tight without external script origins; OAuth flows still work because Auth.js uses same-origin app routes and top-level redirects rather than third-party browser-side fetches.
- **Credential Handling Reality**: Hosted VibeBasket still never sees runtime MCP secrets, but most adapters do need those resolved secrets written into local IDE config files on the user's machine. Codex remains the best current exception for remote auth headers because its TOML supports environment-key references.
- **Rate limiting**: Proxy-derived client IPs are only trusted when `TRUST_PROXY` is enabled; otherwise the limiter now falls back to best-effort header bucketing or a coarse request fingerprint instead of collapsing all production traffic into one global `local` bucket.
- **Backup restore path**: Admin restore now stages a temp file via backend-native download before swapping the SQLite file in place.
- **Local backup snapshots**: Admin local-disk backups now prefer `VACUUM INTO` snapshots before falling back to file copy, reducing WAL-related snapshot drift.

- **Full-Text Search**: FTS5 virtual tables with trigger-based sync and rebuild support. Admin panel exposes FTS5 health check and rebuild action. Prefix-matching enabled. Data column removed from FTS5 content to reduce index size.
- **FTS Self-Healing**: `ensureDatabaseIndexes()` now validates that FTS5 is not just row-count aligned but actually queryable; if `MATCH` is broken or stale after app restart/schema drift, VibeBasket auto-rebuilds the index before serving catalog search.
- **Count Cache**: 60s TTL in-memory cache for catalog counts, avoiding expensive COUNT(*) on every page.
- **Catalog API Cache**: `Cache-Control: max-age=60, stale-while-revalidate=300` on public catalog responses.
- **Mobile**: Basket FAB with bottom sheet on mobile viewports; responsive catalog grid.
- **Homepage**: "Who is this for" section, "How it works" section, marquee IDE icon strip.
- **Helm Chart**: Recreate strategy, securityContext uid 1001, existingSecret support.
- **Verification Reality**: Full `pnpm verify:ci` was re-run successfully in a real shell after the deploy/docs hardening pass; sandboxed Next/Turbopack builds can still false-fail in Codex because helper processes are not allowed to bind local ports there.
- **Repo Hygiene**: Root ignore rules now explicitly cover common package-manager/debug artifacts, and the accidentally tracked `packages/core/tsconfig.tsbuildinfo` build artifact is being removed from version control.
- **Dead Code Hygiene**: Unused starter SVGs in `apps/web/public/` and unattached `apps/web/messages/*.json` locale files were removed after cross-repo reference checks; dependency cleanup stayed intentionally conservative.
- **Compound Indexes**: Covering indexes on main catalog query paths (type + trust + name).
- **Test Isolation**: Adapter tests that used to touch user home directories now redirect to temp directories, reducing permission drift and making CI/self-hosted verification safer.

## Next Steps
- CLI `prune` command
- Expanded E2E test suite
- Tighten backup/restore behavior for non-file `DATABASE_URL` values so admin backup actions fail explicitly instead of relying on local-file assumptions
