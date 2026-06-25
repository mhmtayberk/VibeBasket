# Technical Context

## Tech Stack
- **Language**: TypeScript everywhere, strict mode enabled.
- **Package Manager**: pnpm.
- **Frameworks**: Next.js 16.2.9 (Web), Commander (CLI).
- **Validation**: Zod.
- **Database**: Drizzle ORM with LibSQL/SQLite for catalog, bundles, auth, stacks, sync runs, and backup storage config. WAL mode, 64MB page cache, compound indexes on main catalog query paths (type + trust + name). FTS5 full-text search with trigger-based content sync, prefix-matching, rebuild support. Count cache with 60s TTL for catalog aggregate queries.
- **Catalog Operations**: Manual `catalog:sync` runs now surface collector progress on stderr and expose per-source run summaries in-process; timeout tuning is split between MCP registry (`CATALOG_MCP_REGISTRY_TIMEOUT_MS`) and `skills.sh` (`CATALOG_SKILLS_TIMEOUT_MS`).
- **API Caching**: `Cache-Control: max-age=60, stale-while-revalidate=300` on public `/api/catalog` responses for CDN/browser caching.
- **Encryption**: AES-256-GCM via Node.js `crypto` module. Key derived from `AUTH_SECRET` with `scryptSync`. Used for encrypting cloud storage credentials in `backup_storage_config` table.
- **Cloud SDKs**: `@aws-sdk/client-s3` (S3/R2/Spaces), `@azure/storage-blob` (Azure), `@google-cloud/storage` (GCS). Lazy-loaded via dynamic `import()`.
- **Deployment**: Docker (multi-stage Alpine, standalone output), Docker Compose, Helm chart (Recreate strategy, securityContext uid 1001, existingSecret support).
- **Tooling**: Biome (Linting/Formatting), Vitest (Testing), Playwright (E2E), tsup (CLI bundling).
- **Production Runtime**: Docker, Docker Compose (lean non-root Alpine images, standalone output build).
- **Key Management**: optional `keytar` for OS keychain access in the published CLI package, with fallback to environment variables, `.vibebasket.env`, and interactive prompts when native bindings are unavailable.
- **Public Package**: CLI is published on npm as `vibebasket`; package metadata and package-level README now need to stay aligned with the public GitHub repository and real hosted/self-hosted usage.
- **CI/CD**: GitHub Actions for linting, workspace typecheck, package/web builds, unit/integration tests, Playwright smoke coverage, and CodeQL analysis.
- **Auth**: NextAuth v5 (beta) with Drizzle adapter. 4 providers: GitHub, Google, Apple, Microsoft Entra ID.
- **Request Security**: Route handlers and shared request utilities enforce Origin-based CSRF checks, proxy/IP trust decisions, and global security headers without relying on a Next.js middleware/proxy file.

## Development Constraints
- Functional core, imperative shell.
- Tests written before adapter implementations (TDD).
- Code format enforced by Biome.
- Catalog sync can pull tens of thousands of upstream records, so request amplification and full-list rendering are real concerns.
- Route handlers should favor paged responses and bounded limits.
- Catalog search uses FTS5 full-text indexing with automatic trigger-based content sync and prefix-matching.
- Cloud SDKs must be dynamically imported to avoid Next.js build-time module resolution failures.
- Storage credentials must never be logged or returned to clients.
- Mobile UI must use bottom sheet patterns for small viewports; desktop gets persistent side panels.
