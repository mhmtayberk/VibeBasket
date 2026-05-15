# VibeBasket Web

The web app is the discovery and bundle-building surface for VibeBasket. It lets users browse trusted MCP servers, skills, and rules, add them to a basket, and generate a bundle that the CLI can apply to local IDE configurations.

## What the catalog does

The catalog is backed by the shared `catalog_items` SQLite table and is filled by the registry sync service in `packages/registry`.

Trusted upstream sources currently include:

- VibeBasket curated `verified.yaml`
- Official MCP Registry
- Official skills.sh catalog page

The sync layer normalizes upstream records, deduplicates them by canonical identity, and prefers curated verified records when the same item exists in multiple sources.

## Pagination and performance

Large catalogs can easily reach tens of thousands of items, so the web app intentionally does not render or fetch the entire list at once.

- The catalog API defaults to `24` items per page
- The API caps page size at `100`
- The UI fetches only the active tab and current page
- Search resets pagination to page `1`
- Catalog sync is guarded by a single-flight lock so concurrent requests do not start duplicate sync jobs
- SQLite indexes are created automatically for the catalog query paths used by the app

This keeps the browsing experience predictable while limiting unnecessary database work and upstream sync churn.

## Catalog API

`GET /api/catalog`

Query params:

- `type`: `mcp`, `skill`, or `rule`
- `q`: search query
- `page`: 1-based page number
- `limit`: requested page size
- `refresh=1`: force a sync attempt before reading cached items

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

## Development

From the repo root:

```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

When debugging catalog freshness, use:

```bash
curl 'http://localhost:3000/api/catalog?type=mcp&page=1&limit=24&refresh=1'
```
