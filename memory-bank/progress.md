# Progress — June 15, 2026

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
- [x] Open-source launch hardening: GitHub Actions CI, CodeQL, Dependabot, PR template, Code of Conduct, and production readiness checklist added
- [x] Docs honesty pass: README / CONTRIBUTING / SECURITY / SETUP now document the current verification gate more accurately
- [x] Prod-readiness honesty pass: README, SECURITY.md, docs security content, architecture notes, and llms.txt now reflect the actual catalog scale, secret-handling model, and trust/proxy behavior
- [x] Rate-limit hardening: `cf-connecting-ip` is only honored when `TRUST_PROXY` is explicitly enabled
- [x] Production header hardening: HSTS, `X-Permitted-Cross-Domain-Policies`, `X-Download-Options`, and stricter CSP without inline script allowance
- [x] Admin storage visibility: active backup backend resolution is now async-correct and the UI warns when an incomplete cloud config silently falls back to local storage
- [x] Admin release readiness: deploy-time blockers and warnings are now surfaced for auth, proxy trust, OAuth completeness, refresh token, storage fallback, and SQLite backup compatibility
- [x] Cloud backup restore: storage backends now expose provider-native download flows and admin restore no longer requires manual out-of-band cloud download
- [x] NFT tracing cleanup: admin backup/readiness client flows now go through route handlers, and `next build` no longer emits the prior Turbopack NFT tracing warning
- [x] Security tightening: admin role now requires verified allowlisted email, `x-real-ip` is ignored unless `TRUST_PROXY` is enabled, cookie-authenticated stack mutations enforce same-origin `Origin` checks, and bundle share URLs prefer configured public origin
- [x] Public-launch docs pass: README, SETUP, SECURITY, ARCHITECTURE, PROJECT_OVERVIEW, and `llms.txt` now better document live catalog scale, `AUTH_TRUST_HOST`, first-sync expectations, and backup credential scope
- [x] Public launch quality pass: README and docs hub copy now better explain single-node self-hosting expectations, first-run behavior, and the real installer capability surface
- [x] Pre-prod audit hardening: repo-wide lint green again, package builds passing, focused registry/adapters/core/web tests re-verified
- [x] Migration safety fix: schema bootstrap now restores missing legacy `catalog_items.description` / `icon` columns before FTS initialization, and recreates the saved-stack target position index
- [x] Test isolation cleanup: adapter tests no longer write into the real user home directory during verification
- [x] Playwright harness cleanup: E2E webServer now boots the standalone production server instead of `next start`

## Test Coverage
- Focused CLI, adapter, and web/admin suites covering install verification and operational visibility are passing
- Web TypeScript strict mode: zero errors
- Web production build succeeds in a real shell with no remaining Turbopack NFT tracing warning
- Full Playwright browser E2E could not be completed on this machine because the Chromium Playwright binary is not installed locally

## Next Steps
- CLI `prune` command
- Expanded E2E test suite
- Decide whether non-file `DATABASE_URL` should stay as a warning-only admin signal or become an explicit hard block for built-in backup actions
