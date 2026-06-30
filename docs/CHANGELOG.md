# Changelog

All notable changes to this project are documented here.

This changelog stays intentionally high-signal: it tracks meaningful product and release shifts without repeating volatile counts that are already verified elsewhere by CI, tests, and package metadata.

## [Unreleased]

- Hardened the npm publish workflow so the provenance-attested path matches the documented release process.
- Upgraded encrypted backup-storage writes to a versioned per-record random-salt format while keeping legacy records readable.
- Tightened maintainer docs around trusted publishing, manual dispatch, and local npm credential expectations.

## [0.9.4] — 2026-06-30

### CLI Verification Accuracy
- Fixed CLI post-install verification summaries so targets that do not support MCP configuration no longer report misleading MCP confirmation text.
- Added focused CLI coverage for mixed-target verification output to keep capability-aware install messaging honest.

## [0.9.3] — 2026-06-26

### Release Integrity & Public Launch Hardening
- Added GitHub Actions-based npm trusted publishing with provenance-oriented release checks and stricter publish-time validation.
- Added repo secret scanning and a dedicated `NEXT_PUBLIC_*` guard so accidental client-exposed secrets are caught earlier in CI.
- Fixed CodeQL-relevant issues in HTML entity handling, Goose YAML escaping, and S3 endpoint parsing.
- Tightened Docker/runtime validation, launch docs, and public package hygiene for the open-source release surface.

### Install Correctness & Ops Safety
- Hardened adapter verification so CLI readback checks match target-native MCP config shapes more accurately.
- Improved catalog/operator controls with stricter sync validation commands, better source-level status visibility, and clearer self-hosting guidance.
- Corrected several public docs and metadata surfaces so deployment, Helm, auth, and backup guidance match the real product behavior.

## [0.9.2] — 2026-06-25

### Adapter & CLI Accuracy
- Strengthened adapter install correctness, rollback handling, and capability enforcement across the full 24-target matrix.
- Improved CLI package metadata, npm surface quality, and launch-facing command/docs consistency.
- Tightened route behavior and public-release defaults around auth, stack access, and admin-facing flows.

## [0.9.1] — 2026-06-15

### Catalog, Auth, and Backup Hardening
- Hardened catalog sync integrity, install verification, backup flows, and admin/storage behavior.
- Improved launch-readiness docs, security posture, and self-hosting clarity without changing the project’s single-node operating model.
- Reduced drift between implementation and docs for adapters, bundle behavior, and deployment expectations.

## [0.9.0] — 2026-06-13

### Major Product Expansion
- Expanded VibeBasket to 24 adapter-backed AI IDE and CLI targets.
- Added `vibebasket list` and `vibebasket search` so catalog discovery and local install inspection work from the terminal.
- Improved cross-target behavior so MCPs, Skills, and Rules are applied only where target capabilities truly exist.

### Platform Foundations
- Added stronger auth/admin flows, backup management, and production-readiness work across the web app and CLI.
- Refined target capability modeling so public docs and install behavior align with real adapter support surfaces.

## [0.8.0] — 2026-05-26

### Catalog, Docs, and Reliability Baseline
- Launched the docs hub, improved homepage/catalog UX, and stabilized the initial catalog loading path.
- Added FTS5-backed search, page-based pagination, background catalog refresh, and SQLite concurrency hardening.
- Expanded the adapter base, strengthened rate limiting and security defaults, and improved self-hosting ergonomics.
