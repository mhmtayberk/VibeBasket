# VibeBasket Architecture

## Monorepo
We use `pnpm workspaces` to manage the project.

- `packages/core`: Holds Zod schemas defining the data shape (bundles, MCPs, skills, etc.).
- `packages/adapters`: Contains 24 IDE adapters (Cursor, Windsurf, VS Code/Cline, Antigravity, Claude Code, DeepSeek-TUI, Zed, Codex CLI, Gemini CLI, Junie, Kiro, Cline CLI, Continue, Roo Code, Hermes, OpenClaw, GitHub Copilot, Void Editor, Aider, Cortex Code, Goose, IBM Bob, CodeBuddy, and OpenCode) that handle config generation, backups, and idempotency. 16 adapters extend BaseAdapter for shared readConfig/applyMcps/writeConfig/diff logic.
- `packages/registry`: Automated catalog synchronization logic from trusted external sources and local curated data, including the semver deduplication engine for official upstream MCP servers.
- `apps/web`: Next.js 16.2.9 App Router providing the catalog and selection UI, `/docs` documentation hub, `/stacks` saved-stack management, and the `/admin` stats dashboard.
- `apps/cli`: Node.js CLI tool running the execution environment.

## Data Flow
1. Web App constructs a bundle (JSON).
2. The bundle is verified via Zod (`manifest.ts`).
3. CLI fetches the bundle, resolves secrets locally (never sent to the cloud).
4. Adapters modify IDE configuration files incrementally and idempotently.
5. The CLI re-reads the target configuration and verifies deterministic artifacts after writes when verification is enabled (default).

## Registry Sync System
To keep the catalog fresh without relying on mostly manual entry, VibeBasket implements an automated sync layer:

1. **Collectors**
   - curated `verified.yaml`
   - official MCP Registry
   - official `skills.sh` catalog page
2. **Normalization**
   - external metadata is transformed into internal Zod-validated `McpEntry`, `SkillEntry`, `RuleEntry`, or `WorkflowPackEntry`
   - item-level freshness metadata is attached during persistence: `sourceName`, `sourceUrl`, `firstSeenAt`, `lastSeenAt`, `lastSyncedAt`
3. **Semver Deduplication (MCP Registry)**
   - the official MCP registry lists every published version of each npm/pypi/docker package as a separate entry
   - `OfficialMcpRegistryCollector` groups all entries by `server.name` (lowercased) and keeps only the record with the highest semantic version via `compareSemver`
   - this prevents multiple cards for the same logical server (e.g. nine `.FAF Context` variants) from cluttering the catalog
4. **Canonical dedupe (cross-source)**
   - MCPs are deduped by runtime/command/args/url identity
   - Skills are deduped by source identity such as `repo + path`
   - generated catalog IDs include the same canonical runtime/source identity so upstream variants do not overwrite each other during persistence
5. **Verified precedence**
   - if a curated verified record conflicts with an upstream record, the verified record wins
6. **Trust scoring**
   - trust is currently derived, not stored: `verified`, official source identity, and freshness metadata combine into a visible `verified` / `official` / `community` trust tier
7. **Source isolation**
   - one broken upstream source should not fail the entire sync run
   - sync summary now surfaces source-level errors explicitly

## Backup & Storage System
The admin panel provides a multi-cloud storage system for database backups with six backends:

- **Local**: Default filesystem backup in a configurable directory.
- **S3-compatible**: AWS S3, Cloudflare R2, and DigitalOcean Spaces — all share one implementation via `@aws-sdk/client-s3`.
- **Azure Blob Storage**: Via `@azure/storage-blob`.
- **Google Cloud Storage**: Via `@google-cloud/storage`.

Cloud SDKs are lazily loaded via dynamic `await import()` to prevent Next.js build-time module resolution errors. Storage credentials are encrypted with AES-256-GCM (key derived from `AUTH_SECRET` via `scryptSync`) and stored in the `backup_storage_config` SQLite table. Configuration is managed through the admin panel UI — changing backends does not require a server restart. Scheduled backups can be configured with configurable hourly intervals.

## Performance & Scalability
- **Full-Text Search**: Global catalog search uses FTS5 virtual tables with automatic trigger-based content sync and rebuild support. Queries are run through parameterized SQL to prevent injection. FTS5 data column removed to reduce index size; prefix-matching enabled for partial word queries (e.g. "postgr" matches "postgresql").
- **Count Cache**: Catalog counts cached in-memory with 60s TTL to avoid expensive `COUNT(*)` on every page render. Cache is invalidated automatically.
- **Catalog API Cache**: Public catalog responses carry `Cache-Control: max-age=60, stale-while-revalidate=300` so CDNs and browsers can serve slightly stale data while the background revalidation completes.
- **Batched Persistence**: registry sync persists catalog rows in batches instead of one row at a time, which reduces write pressure during large syncs.
- **Page-Based Pagination**: `/api/catalog` returns `items + pagination` and the web UI only fetches the active tab and current page.
- **Server-Rendered Initial Catalog**: the homepage reads the first MCP page from SQLite on the server and passes it into the catalog client component, so first paint is not dependent on client hydration or an initial `/api/catalog` fetch.
- **Derived Trust Signals**: catalog cards render trust badges and freshness labels from item metadata without needing a second scoring table.
- **Trust-Aware Discovery**: trust and freshness metadata now participate in filtering and sorting, so recommended results prefer verified, official, and recently synced entries without breaking pagination.
- **Reasonable Limits**: API defaults to `24` items per page and caps page size at `100`.
- **Debounced Input**: Frontend uses a 300ms debounce to minimize API pressure while maintaining a responsive feel.
- **Single-Flight Sync Guard**: when the catalog is stale, concurrent requests share one sync job instead of starting duplicates.
- **Automatic SQLite Indexes**: catalog reads ensure query indexes exist for the active access pattern (including compound indexes on type + trust + name).
- **Operational Visibility Without Heavy Infra**: admin health signals are derived from `catalog_sync_runs` and catalog source counts instead of introducing a separate telemetry service.

## Catalog API

`GET /api/catalog`

Query params:

- `type`: `mcp`, `skill`, `rule`
- `q`: search term
- `page`: 1-based page number
- `limit`: page size, capped server-side
- `trust`: `all`, `verified`, `official`, `community`
- `freshness`: `all`, `fresh`, `recent`, `aging`
- `sort`: `recommended`, `freshest`, `name`
- `refresh=1`: force sync attempt before serving results; in production this requires `x-vibebasket-refresh-token` to match `CATALOG_REFRESH_TOKEN`

Response shape:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 24,
    "total": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

`GET /api/catalog/status`

Returns current catalog counts, freshness derived from the newest catalog row, and the latest recorded sync run summary from `catalog_sync_runs`.

## Helm Chart (Kubernetes)

The `charts/vibebasket/` chart provides a production Kubernetes deployment:

- **Strategy**: `Recreate` — single-replica to avoid SQLite write conflicts.
- **Security Context**: `runAsUser: 1001`, `runAsGroup: 1001`, `fsGroup: 1001` for non-root operation.
- **Secret Management**: Supports `existingSecret` for credentials. Uses `env` and `envFrom` values for `AUTH_SECRET`, `NEXTAUTH_URL`, and OAuth provider credentials.
- **Persistence**: PVC-backed volume mount for SQLite at `/data`.
- **Health Check**: Docker-style `livenessProbe` and `readinessProbe` via `/api/health`.

## Mobile & Responsive UI

- **Basket FAB**: Floating action button on mobile viewports opens a bottom sheet for basket contents and bundle generation.
- **Responsive Grid**: Catalog items use a CSS Grid that adapts column count by viewport width (`grid-cols-1` to `grid-cols-3`).
- **Desktop**: Persistent side panel for basket on wider viewports. Mobile: FAB + bottom sheet pattern.

## Homepage Structure

The homepage (`/`) is `force-dynamic` and server-renders:
1. **Hero**: Tagline with marquee strip of 24 IDE icons (`targets/` SVGs).
2. **"Who is this for"**: Three-card section targeting AI developers, vibe coders, and teams.
3. **"How it works"**: Three-step flow — Browse, Bundle, Apply — with code snippets.
4. **Catalog Preview**: First MCP page server-rendered from SQLite.

## Important Technical Notes

- DB path resolution is anchored to the workspace root rather than `process.cwd()`
- the homepage is intentionally `force-dynamic` because the first catalog page is a live server-side snapshot from SQLite
- public catalog reads can schedule stale background sync, but forced refresh is protected in production to avoid unauthenticated expensive sync DoS
- manual syncs can be run with `pnpm catalog:sync`, which now records audit rows in `catalog_sync_runs`
- item-level freshness now lives on `catalog_items` itself, so future UI trust/freshness badges do not need a second storage model
- the web package now participates in workspace `test` and `typecheck` runs, so catalog discovery logic is covered by the same verification path as the packages
- catalog selection state in the web app is driven directly from the basket store state
- basket persistence falls back to an in-memory adapter outside the browser so tests and SSR contexts do not emit noisy missing-`localStorage` warnings
- the installer side still lags behind the manifest surface for some non-MCP entry types
- the target picker now mirrors the real adapter-backed set instead of keeping a visible roadmap/watchlist tier
- `project` scope apply now forwards the working directory as `projectRoot`, which closes an earlier bug where project-scoped adapters had the right path logic but were never given the project path at runtime

## Production & Deployment Architecture

### 🐳 Docker & Self-Hosting Pipeline
- **Next.js Standalone Mode:** Configured `output: 'standalone'` in `next.config.ts`. The Docker build uses this lean, self-contained server layout, only bundling required `node_modules` and files, reducing the production image to under 150MB.
- **Multi-stage Alpine Runtime:** A secure, non-root Node.js 22 Alpine multi-stage `Dockerfile` handles installation, building, and runner optimization stages.
- **SQLite Persistence:** Mounts a Docker volume at `/data` mapping SQLite `.db` records to keep user stacks and authenticated accounts safe during container updates.
- **docker-compose.yml Spec:** Integrates an automatic container health check, binds default port `3000`, and provisions named volume mount points securely.

### 🛡️ Secure Health Checks & Cache Shielding
- **Database Status Probe:** `/api/health` performs a live select on the SQLite `users` table via Drizzle to assert true database status.
- **Anti-DoS Protection:** The database verification is guarded by a 5-second in-memory cache TTL. Rapid health check pings (e.g., from Kubernetes or Docker probes) are served immediately from memory without contacting SQLite.
- **Zero-Cache Response Headers:** Sets strict HTTP `no-store, no-cache, must-revalidate` directives to avoid stale proxies hiding dead servers.

### 🗺️ Sitemap & Query Hardening
- **Information Leak Protection:** `sitemap.ts` includes `/docs` alongside `/` and `/stacks` but intentionally excludes user-created stack pages (`/bundle/[id]`) and `/admin` routes. This guards against search engines indexing personal development context profiles (Information Disclosure defense).
- **docs Route Boundaries:** Protects against Local/Remote File Inclusion (LFI/RFI) by validating the docs `tab` search parameter against an allowed whitelist. The arama search parameter is capped at 100 characters to prevent ReDoS (Regular Expression Denial of Service) and XSS enjections.
