# Active Context

## Current State

- **Multi-Cloud Backup Storage System (DB-Backed):**
  - Six storage backends implemented: Local, AWS S3, Cloudflare R2, DigitalOcean Spaces, Azure Blob Storage, Google Cloud Storage.
  - R2 and Spaces piggyback on S3 via S3-compatible protocol — one implementation for three providers.
  - AES-256-GCM encrypted credential storage in SQLite `backup_storage_config` table. Key derived from `AUTH_SECRET` via scryptSync.
  - DB-first configuration: credentials stored in DB take precedence, env vars (`BACKUP_STORAGE_BACKEND`) as fallback, local as ultimate fallback. Changing backends does NOT require server restart.
  - Cloud SDKs (`@aws-sdk/client-s3`, `@azure/storage-blob`, `@google-cloud/storage`) are dynamically imported only when their backend is activated — no static import chain that breaks Next.js builds.
  - Admin panel storage management: full-width card with backend selector table (6 rows: status, active indicator, Setup/Edit button), dynamic credential forms per backend type, Save & Activate, Reset to Env, backup operations (create/list/restore/delete).
  - 25 unit + edge case + chaos tests covering local backups, factory backend selection, concurrent operations, and graceful DB-not-available fallback.

- **Microsoft Entra ID (Azure AD) Auth Provider:**
  - Fourth OAuth provider added alongside GitHub, Google, Apple. Uses `microsoft-entra-id` provider with `/common/` endpoint.
  - Independently gateable via `AUTH_MICROSOFT_ENTRA_ID_ENABLED/ID/SECRET`.
  - `.env.example` updated with all 4 providers documented.

- **Admin Panel Redesign:**
  - Consistent with project design tokens (`--background`, `--accent`, `--foreground`, `--radius: 0.125rem`). Removed all hardcoded colors and rounded corners.
  - Leaderboard converted to proper `<table>` structure. SyncButton redesigned with spinner and hover states.
  - Backup card as full-width `md:col-span-3` section.

- **Registry Sync Hardening:**
  - `triggerSyncAction` uses dynamic `await import("@vibebasket/registry")` to avoid Next.js server action bundle issues.
  - Null-safe summary fields, proper `instanceof Error` checks, try/catch on network errors.
  - 18 sync edge case tests covering auth guards, error types, concurrent calls, revalidatePath behavior.
  - Concurrency analysis verified: SQLite WAL + separate tables + transactional sync = no data corruption risk.

- **Test Coverage:** 93 Vitest tests (up from 66) all passing. TypeScript strict mode with zero errors.

## Next Steps
- CLI `list` and `prune` command implementation.
- Playwright E2E tests for rate limit and storage management flows.
- Documentation update for cloud backup configuration.

## Considerations
- **Security:** Credentials encrypted at rest with AES-256-GCM. Admin-only access enforced via `requireAdminRole()`. Never exposed in client-side responses.
- **Portability:** DB-first config means backup strategy survives container restarts and deploys. Local fallback ensures no data loss during cloud outages.
- **Scalability:** All 6 backends share the same interface — adding a new provider requires only a new class implementing `StorageBackend`.