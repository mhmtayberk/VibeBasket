# VibeBasket Architecture

## Monorepo
We use `pnpm workspaces` to manage the project.

- `packages/core`: Holds Zod schemas defining the data shape (bundles, MCPs, skills, etc.).
- `packages/adapters`: Contains IDE adapters (Cursor, VS Code/Cline, Windsurf, Antigravity, Claude Code, DeepSeek-TUI, Zed, Codex CLI, Gemini CLI, Junie, Kiro, Cline CLI, Continue, Roo Code, Hermes, and OpenClaw) that handle config generation, backups, and idempotency.
- `packages/registry`: Automated catalog synchronization logic from trusted external sources and local curated data, including the semver deduplication engine for official upstream MCP servers.
- `apps/web`: Next.js 16 App Router providing the catalog and selection UI, `/docs` documentation hub, `/stacks` saved-stack management, and the `/admin` stats dashboard.
- `apps/cli`: Node.js CLI tool running the execution environment.

## Data Flow
1. Web App constructs a bundle (JSON).
2. The bundle is verified via Zod (`manifest.ts`).
3. CLI fetches the bundle, resolves secrets locally (never sent to the cloud).
4. Adapters modify IDE configuration files incrementally and idempotently.

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

## Performance & Scalability
- **Server-Side Search**: Global search currently uses SQL `LIKE` over `display_name` and `description`.
- **Batched Persistence**: registry sync persists catalog rows in batches instead of one row at a time, which reduces write pressure during large syncs.
- **Page-Based Pagination**: `/api/catalog` returns `items + pagination` and the web UI only fetches the active tab and current page.
- **Server-Rendered Initial Catalog**: the homepage reads the first MCP page from SQLite on the server and passes it into the catalog client component, so first paint is not dependent on client hydration or an initial `/api/catalog` fetch.
- **Derived Trust Signals**: catalog cards render trust badges and freshness labels from item metadata without needing a second scoring table.
- **Trust-Aware Discovery**: trust and freshness metadata now participate in filtering and sorting, so recommended results prefer verified, official, and recently synced entries without breaking pagination.
- **Reasonable Limits**: API defaults to `24` items per page and caps page size at `100`.
- **Debounced Input**: Frontend uses a 300ms debounce to minimize API pressure while maintaining a responsive feel.
- **Single-Flight Sync Guard**: when the catalog is stale, concurrent requests share one sync job instead of starting duplicates.
- **Automatic SQLite Indexes**: catalog reads ensure query indexes exist for the active access pattern.

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
