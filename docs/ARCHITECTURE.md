# VibeBasket Architecture

## Monorepo
We use `pnpm workspaces` to manage the project.

- `packages/core`: Holds Zod schemas defining the data shape (bundles, MCPs, skills, etc.).
- `packages/adapters`: Contains IDE adapters (currently Cursor, VS Code/Cline, Windsurf, Antigravity, Claude Code, Zed, Codex CLI, Gemini CLI, Junie, Kiro, and Cline CLI) that handle config generation, backups, and idempotency.
- `packages/registry`: Automated catalog synchronization logic from trusted external sources and local curated data.
- `apps/web`: Next.js 15 App Router providing the catalog and selection UI.
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
3. **Canonical dedupe**
   - MCPs are deduped by runtime/command/args/url identity
   - Skills are deduped by source identity such as `repo + path`
4. **Verified precedence**
   - if a curated verified record conflicts with an upstream record, the verified record wins
5. **Source isolation**
   - one broken upstream source should not fail the entire sync run
   - sync summary now surfaces source-level errors explicitly

## Performance & Scalability
- **Server-Side Search**: Global search currently uses SQL `LIKE` over `display_name` and `description`.
- **Page-Based Pagination**: `/api/catalog` returns `items + pagination` and the web UI only fetches the active tab and current page.
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
- `refresh=1`: force sync attempt before serving results

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

## Important Technical Notes

- DB path resolution is anchored to the workspace root rather than `process.cwd()`
- catalog selection state in the web app is driven directly from the basket store state
- the installer side still lags behind the manifest surface for some non-MCP entry types
- the target picker intentionally contains a slightly wider set of popular AI IDEs and agent CLIs than the adapter layer currently supports; bundle generation still validates against the supported subset only, leaving `Trae` in watchlist mode
- `project` scope apply now forwards the working directory as `projectRoot`, which closes an earlier bug where project-scoped adapters had the right path logic but were never given the project path at runtime
