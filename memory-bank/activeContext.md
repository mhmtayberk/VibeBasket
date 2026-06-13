# Active Context (June 13, 2026)

## Current State

- **23 IDE Adapters**: 15 extended from BaseAdapter (code reduced 49%). 8 kept with custom logic. Zero tests broken.

- **Registry Split**: 1346-line monolith → 6 modules. Clean imports, no logic changes.

- **Docs Split**: 1022-line page.tsx → 368-line shell + 7 tab components. Zero errors.

- **Drizzle Kit**: Migration system configured. Existing bootstrap kept as fallback. PRAGMA auto_vacuum + mmap_size added.

- **DB Quality**: cleanupStaleData() runs hourly — sessions, verification_tokens, sync_runs (200 retention), expired registered bundles (365d), incremental_vacuum.

- **Shared UI**: Chip (4 variants), MonoLabel — available for new code.

- **Test Coverage**: 100 tests (web). TypeScript strict mode, zero errors. All adapter + CLI tests pass.

- **Security**: next.config.ts global headers + CSP (production). 9 endpoints rate-limited (sliding window). SameSite CSRF.

## Architecture Notes
- **DB-first config**: Storage credentials encrypted. Resolution: DB → env → local.
- **Lazy-loaded cloud SDKs**: Dynamic import prevents Next.js build errors.
- **BaseAdapter**: Shared readConfig, applyMcps, writeConfig, diff for 15 adapters.
- **Security headers**: next.config.ts async headers() applies globally. CSP production-only.

## Next Steps
- CLI `prune` command
- Mobile responsive improvements
- Search improvements (FTS5)
- E2E test suite