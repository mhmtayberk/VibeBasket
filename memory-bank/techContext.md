# Technical Context

## Tech Stack
- **Language**: TypeScript everywhere, strict mode enabled.
- **Package Manager**: pnpm.
- **Frameworks**: Next.js 15 (Web), Commander (CLI).
- **Validation**: Zod.
- **Database**: Drizzle ORM with LibSQL/SQLite for the current catalog and bundle store.
- **Tooling**: Biome (Linting/Formatting), Vitest (Testing), Playwright (E2E), tsup (CLI bundling).
- **Key Management**: keytar (for OS keychain access).
- **CI/CD**: GitHub Actions (Lint, Test, Build, Ingest, Release via Changesets).

## Development Constraints
- Functional core, imperative shell.
- Tests written before adapter implementations (TDD).
- Code format enforced by Biome.
- Catalog sync can pull tens of thousands of upstream records, so request amplification and full-list rendering are real concerns.
- Route handlers should favor paged responses and bounded limits.
- Runtime indexing is currently used to keep local SQLite queries healthy until a stronger migration story is added.
