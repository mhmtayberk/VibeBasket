# Active Context (June 13, 2026)

## Current State

- **24 IDE Adapters**: 16 extended from BaseAdapter (code reduced 49%). 8 kept with custom logic. Zero tests broken.

- **Registry Split**: 1346-line monolith → 6 modules. Clean imports, no logic changes.

- **Docs Split**: 1022-line page.tsx → 368-line shell + 7 tab components. Zero errors.

- **Drizzle Kit**: Migration system configured. Existing bootstrap kept as fallback. PRAGMA auto_vacuum + mmap_size added.

- **DB Quality**: cleanupStaleData() runs hourly — sessions, verification_tokens, sync_runs (200 retention), expired registered bundles (365d), incremental_vacuum.

- **Shared UI**: Chip (4 variants), MonoLabel — available for new code.

- **Test Coverage**: Focused suites for web/admin, adapters, and CLI install verification are passing. Web TypeScript typecheck is clean.

- **Security**: next.config.ts global headers + CSP (production). 9 endpoints rate-limited (sliding window). SameSite CSRF.
- **Install Correctness**: CLI apply now supports post-install verification, and adapter capability metadata is being kept aligned with real adapter behavior.
- **Catalog Integrity**: `skills.sh` sync now preserves community skills during sitemap/directory fallback, and official/community source tags are normalized for trust badges and health reporting.
- **CLI Inventory Accuracy**: `vibebasket list` now inspects adapter-specific skill/rule install surfaces instead of generic shared paths.

## Architecture Notes
- **DB-first config**: Storage credentials encrypted. Resolution: DB → env → local.
- **Lazy-loaded cloud SDKs**: Dynamic import prevents Next.js build errors.
- **BaseAdapter**: Shared readConfig, applyMcps, writeConfig, diff for 16 adapters.
- **Security headers**: next.config.ts async headers() applies globally. CSP production-only.

## Next Steps
- CLI `prune` command
- Mobile responsive improvements
- Search improvements (FTS5)
- E2E test suite
