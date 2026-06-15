# Active Context (June 15, 2026)

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
- **Catalog Integrity**: `skills.sh` sync now preserves community skills during sitemap/directory fallback, and official/community source tags are normalized for trust badges and health reporting.
- **CLI Inventory Accuracy**: `vibebasket list` now inspects adapter-specific skill/rule install surfaces instead of generic shared paths.
- **Release Automation**: GitHub Actions CI, CodeQL, Dependabot, PR template, and a production readiness checklist are being added to support public launch and self-hosted production use.
- **Pre-Prod Audit**: Repo-wide Biome lint is green again, package builds pass, and focused registry/adapters/core/web test surfaces have been re-verified during prod-readiness hardening.
- **Migration Safety**: Legacy `catalog_items` upgrades now backfill missing `description`/`icon` columns before FTS bootstrap, and saved-stack target indexes are recreated during schema bootstrap.
- **Build Reality**: `pnpm --filter web build` now succeeds without the prior Turbopack NFT tracing warning after moving admin backup/readiness client calls onto route handlers.
- **Storage Visibility**: Admin backup UI can now surface when a configured cloud backend is incomplete and the runtime has fallen back to local storage.
- **Release Readiness**: Admin now computes deploy-time blockers/warnings for auth, proxy trust, OAuth provider completeness, refresh token, storage fallback, and SQLite backup compatibility.
- **Cloud Restore**: Backup restore now supports local plus provider-native cloud download paths for S3/R2/Spaces, Azure Blob, and GCS.
- **Security Tightening**: Admin role promotion now requires a verified allowlisted email, proxy-derived IP headers are trusted only in `TRUST_PROXY` mode, stack mutations enforce same-origin checks, and bundle share URLs prefer configured public origin.
- **Launch Docs**: README, SETUP, SECURITY, ARCHITECTURE, PROJECT_OVERVIEW, and `llms.txt` now better reflect live catalog variability, `AUTH_TRUST_HOST`, first-sync expectations, and backup-credential handling.
- **Public Launch Quality**: README and public docs now explain the intended single-node deployment model more directly, set clearer first-run expectations, and describe the CLI/install surface in more honest product language.
- **E2E Harness**: Playwright now boots the app through a production-like standalone server path instead of `next start`; full browser E2E still requires local Playwright browser binaries to be installed on the machine running the suite.

## Architecture Notes
- **Next.js 16.2.9**: App Router, standalone output, production CSP.
- **DB-first config**: Storage credentials encrypted. Resolution: DB → env → local.
- **Lazy-loaded cloud SDKs**: Dynamic import prevents Next.js build errors.
- **BaseAdapter**: Shared readConfig, applyMcps, writeConfig, diff for 16/24 adapters.
- **Security headers**: next.config.ts async headers() applies globally. CSP production-only.
- **Rate limiting**: Proxy-derived client IPs are only trusted when `TRUST_PROXY` is enabled; otherwise the limiter falls back to direct request headers conservatively.
- **Backup restore path**: Admin restore now stages a temp file via backend-native download before swapping the SQLite file in place.

- **Full-Text Search**: FTS5 virtual tables with trigger-based sync and rebuild support. Admin panel exposes FTS5 health check and rebuild action. Prefix-matching enabled. Data column removed from FTS5 content to reduce index size.
- **Count Cache**: 60s TTL in-memory cache for catalog counts, avoiding expensive COUNT(*) on every page.
- **Catalog API Cache**: `Cache-Control: max-age=60, stale-while-revalidate=300` on public catalog responses.
- **Mobile**: Basket FAB with bottom sheet on mobile viewports; responsive catalog grid.
- **Homepage**: "Who is this for" section, "How it works" section, marquee IDE icon strip.
- **Helm Chart**: Recreate strategy, securityContext uid 1001, existingSecret support.
- **Compound Indexes**: Covering indexes on main catalog query paths (type + trust + name).
- **Test Isolation**: Adapter tests that used to touch user home directories now redirect to temp directories, reducing permission drift and making CI/self-hosted verification safer.

## Next Steps
- CLI `prune` command
- Expanded E2E test suite
- Tighten backup/restore behavior for non-file `DATABASE_URL` values so admin backup actions fail explicitly instead of relying on local-file assumptions
