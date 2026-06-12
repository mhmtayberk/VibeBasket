# Technical Context

## Tech Stack
- **Language**: TypeScript everywhere, strict mode enabled.
- **Package Manager**: pnpm.
- **Frameworks**: Next.js 16 (Web), Commander (CLI).
- **Validation**: Zod.
- **Database**: Drizzle ORM with LibSQL/SQLite for catalog, bundles, auth, stacks, sync runs, and backup storage config.
- **Encryption**: AES-256-GCM via Node.js `crypto` module. Key derived from `AUTH_SECRET` with `scryptSync`. Used for encrypting cloud storage credentials in `backup_storage_config` table.
- **Cloud SDKs**: `@aws-sdk/client-s3` (S3/R2/Spaces), `@azure/storage-blob` (Azure), `@google-cloud/storage` (GCS). Lazy-loaded via dynamic `import()`.
- **Tooling**: Biome (Linting/Formatting), Vitest (Testing), Playwright (E2E), tsup (CLI bundling).
- **Production Runtime**: Docker, Docker Compose (lean non-root Alpine images, standalone output build).
- **Key Management**: keytar (for OS keychain access).
- **CI/CD**: GitHub Actions (Lint, Test, Build, Ingest, Release via Changesets).
- **Auth**: NextAuth v5 (beta) with Drizzle adapter. 4 providers: GitHub, Google, Apple, Microsoft Entra ID.
- **Middleware**: Next.js Edge Middleware for CSRF protection (Origin validation) and global security headers.

## Development Constraints
- Functional core, imperative shell.
- Tests written before adapter implementations (TDD).
- Code format enforced by Biome.
- Catalog sync can pull tens of thousands of upstream records, so request amplification and full-list rendering are real concerns.
- Route handlers should favor paged responses and bounded limits.
- Runtime indexing is currently used to keep local SQLite queries healthy until a stronger migration story is added.
- Cloud SDKs must be dynamically imported to avoid Next.js build-time module resolution failures.
- Storage credentials must never be logged or returned to clients.

