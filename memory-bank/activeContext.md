# Active Context (June 13, 2026)

## Current State

- **24 IDE Adapters**: 16 extended from BaseAdapter (code reduced 49%). 8 kept with custom logic. Zero tests broken.

- **Registry Split**: 1346-line monolith → 6 modules. Clean imports, no logic changes.

- **Docs Split**: 1022-line page.tsx → 368-line shell + 7 tab components. Zero errors.

- **Drizzle Kit**: Migration system configured. Existing bootstrap kept as fallback. PRAGMA auto_vacuum + mmap_size added.

- **DB Quality**: cleanupStaleData() runs hourly — sessions, verification_tokens, sync_runs (200 retention), expired registered bundles (365d), incremental_vacuum.

- **Shared UI**: Chip (4 variants), MonoLabel — available for new code.

- **Test Coverage**: Focused suites for web/admin, adapters, and CLI install verification are passing. Web TypeScript typecheck is clean.

- **Security**: next.config.ts global headers + CSP (production). 8 endpoints rate-limited (sliding window). SameSite CSRF.
- **Install Correctness**: CLI apply now supports post-install verification, and adapter capability metadata is being kept aligned with real adapter behavior.
- **Catalog Integrity**: `skills.sh` sync now preserves community skills during sitemap/directory fallback, and official/community source tags are normalized for trust badges and health reporting.
- **CLI Inventory Accuracy**: `vibebasket list` now inspects adapter-specific skill/rule install surfaces instead of generic shared paths.

## Architecture Notes
- **Next.js 16.2.9**: App Router, standalone output, production CSP.
- **DB-first config**: Storage credentials encrypted. Resolution: DB → env → local.
- **Lazy-loaded cloud SDKs**: Dynamic import prevents Next.js build errors.
- **BaseAdapter**: Shared readConfig, applyMcps, writeConfig, diff for 16/24 adapters.
- **Security headers**: next.config.ts async headers() applies globally. CSP production-only.

- **Full-Text Search**: FTS5 virtual tables with trigger-based sync and rebuild support. Admin panel exposes FTS5 health check and rebuild action. Prefix-matching enabled. Data column removed from FTS5 content to reduce index size.
- **Count Cache**: 60s TTL in-memory cache for catalog counts, avoiding expensive COUNT(*) on every page.
- **Catalog API Cache**: `Cache-Control: max-age=60, stale-while-revalidate=300` on public catalog responses.
- **Mobile**: Basket FAB with bottom sheet on mobile viewports; responsive catalog grid.
- **Homepage**: "Who is this for" section, "How it works" section, marquee IDE icon strip.
- **Helm Chart**: Recreate strategy, securityContext uid 1001, existingSecret support.
- **Compound Indexes**: Covering indexes on main catalog query paths (type + trust + name).

## Next Steps
- CLI `prune` command
- Expanded E2E test suite
