# System Patterns

## Architecture
- **Monorepo**: pnpm workspaces
- **Web App**: Next.js 15 App Router, Tailwind, shadcn/ui, Drizzle ORM, SQLite-backed catalog API.
- **CLI**: Node CLI using Commander + @inquirer/prompts.
- **Shared Core**: `@vibebasket/core` exporting single source of truth Zod schemas (`manifest.ts`).
- **Adapters**: `@vibebasket/adapters` containing classes that implement the `IdeAdapter` interface.
- **Registry Layer**: `@vibebasket/registry` aggregates curated and trusted upstream sources into the shared catalog table.

## Key Design Patterns
- **Idempotency**: CLI config writers must never corrupt existing configurations and always merge safely.
- **Data Immutability**: Bundles are immutable once generated.
- **Functional Core, Imperative Shell**: Core business logic is isolated from file system calls.
- **Fail-Safe Processing**: Registry ingestion isolates errors so one bad source doesn't fail the entire job.
- **Canonical Dedupe**: Upstream records are normalized and deduplicated by stable identities instead of trusting source IDs blindly.
- **Verified Override**: Curated verified entries are allowed to override upstream representations of the same logical item.
- **Page-Based Catalog Access**: The UI should browse the catalog in pages, not by loading the entire dataset into the client.
- **Single-Flight Sync**: When the catalog is stale, one request performs the sync and others wait for the same promise.
