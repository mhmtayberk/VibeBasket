# Progress — June 13, 2026

## Completed This Session
- [x] Registry split: 1346-line monolith → 6 modules (schemas, utils, 3 collectors, index)
- [x] Docs split: 1022-line page.tsx → 368-line shell + 7 tab components
- [x] Adapter refactor: BaseAdapter class + 16/24 adapters converted (-49% code)
- [x] Drizzle Kit: config + migration generated (drizzle/0000_flaky_millenium_guard.sql)
- [x] DB Quality: auto_vacuum INCREMENTAL, mmap_size 256MB, cleanupStaleData()
- [x] UI Components: Chip (4 variants), MonoLabel
- [x] New tests: bundle lifecycle (5) + data cleanup (2). Web test suite now at 165 tests.
- [x] 5 new IDE adapters: Cortex Code, Goose, IBM Bob, CodeBuddy, OpenCode (24 total)
- [x] CLI: list + search commands (6 total)
- [x] Cross-target capability: warn + continue in CLI, warning in web UI
- [x] Bundle preview in basket panel
- [x] Security: path traversal fix, error message sanitization, global security headers
- [x] Documentation: full audit completed, all files current
- [x] Install correctness: fixed Zed MCP schema mapping, added post-install verification, aligned OpenCode capability metadata
- [x] Operational visibility: admin dashboard now surfaces freshness, sync resilience, collector health, and recent sync runs
- [x] Catalog integrity: skills.sh fallback now keeps community skills, normalizes official/community source tags, and aligns admin collector health with persisted source names
- [x] CLI inventory accuracy: `vibebasket list` now reads adapter-native skill/rule locations instead of guessing shared folders
- [x] FTS5 full-text search: virtual table with trigger-based sync, admin health check, rebuild support, prefix-matching, data column removed
- [x] Count cache: 60s TTL in-memory cache for catalog aggregate queries to avoid expensive COUNT(*)
- [x] Catalog API cache: `Cache-Control: max-age=60, stale-while-revalidate=300` on public catalog responses
- [x] Compound indexes: covering indexes on type + trust + name for main catalog query paths
- [x] Helm chart: Recreate strategy, securityContext uid 1001, existingSecret, PVC persistence
- [x] Mobile: basket FAB with bottom sheet, responsive catalog grid
- [x] Homepage: "Who is this for" section, "How it works" section, marquee IDE icon strip
- [x] Rate limiting: 8 endpoints with sliding window (corrected from previously documented 9)

## Test Coverage
- Focused CLI, adapter, and web/admin suites covering install verification and operational visibility are passing
- Web TypeScript strict mode: zero errors

## Next Steps
- CLI `prune` command
- Expanded E2E test suite
