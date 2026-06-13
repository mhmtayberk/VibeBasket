# System Patterns

## Architecture
- **Monorepo**: pnpm workspaces
- **Web App**: Next.js 16 App Router, Tailwind, shadcn/ui, Drizzle ORM, SQLite-backed catalog API.
- **CLI**: Node CLI using Commander + @inquirer/prompts.
- **Shared Core**: `@vibebasket/core` exporting single source of truth Zod schemas (`manifest.ts`).
- **Adapters**: `@vibebasket/adapters` containing classes that implement the `IdeAdapter` interface.
- **Registry Layer**: `@vibebasket/registry` aggregates curated and trusted upstream sources into the shared catalog table.

## Key Design Patterns
- **Idempotency**: CLI config writers must never corrupt existing configurations and always merge safely. Roo Code, Hermes, and OpenClaw adapters use `>>> VIBEBASKET START/END <<<` block delimiters for idempotent rule/skill writes.
- **Data Immutability**: Bundles are immutable once generated.
- **Functional Core, Imperative Shell**: Core business logic is isolated from file system calls.
- **Fail-Safe Processing**: Registry ingestion isolates errors so one bad source doesn't fail the entire job.
- **Canonical Dedupe**: Upstream records are normalized and deduplicated by stable identities instead of trusting source IDs blindly.
- **Verified Override**: Curated verified entries are allowed to override upstream representations of the same logical item.
- **Page-Based Catalog Access**: The UI should browse the catalog in pages, not by loading the entire dataset into the client.
- **Single-Flight Sync**: When the catalog is stale, one request performs the sync and others wait for the same promise.
- **Health Cache Shielding (DoS Prevention)**: Lightweight connection endpoints or system status checks (e.g. `/api/health`) must be protected behind memory-persistent cache limits (5s TTL) to prevent SQLite/server flooding.
- **Whitelisting Route Boundaries**: User-controlled parameters (docs tab, search query) are bound to whitelists and constrained by length to protect against LFI/RFI directory traversal, ReDoS, and XSS.
- **DB-First Configuration with Encrypted Fallback**: Storage backend credentials are stored encrypted (AES-256-GCM) in SQLite. Resolution order: DB config → env vars → local. Changing config does not require server restart.
- **Lazy Cloud SDK Loading**: Cloud provider SDKs are dynamically imported only when their backend is activated. Barrel files avoid static re-exports to prevent Next.js build-time module resolution errors.
- **Strategy Pattern for Storage Backends**: All six storage backends implement the same `StorageBackend` interface, making them interchangeable at runtime. Adding a new provider requires only a new class implementation.

