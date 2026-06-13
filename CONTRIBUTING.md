# Contributing to VibeBasket

Thanks for contributing. This guide covers setup, conventions, and the PR workflow.

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9
- **Git**

## Setup

```bash
git clone https://github.com/vibebasket/vibebasket.git
cd vibebasket
pnpm install
```

## Project Structure

```
apps/
  web/          Next.js 16 App Router — the catalog UI and API
  cli/          Node.js CLI — `vibebasket apply`, `list`, `search`, `doctor`
packages/
  core/         Shared DB schema, bundle manifest types, SQLite client
  adapters/     24 IDE adapters with BaseAdapter pattern
  registry/     Catalog sync engine — merges verified + upstream sources
```

## Development

```bash
# Start the web app
pnpm --filter web dev

# Run tests for a package
pnpm --filter web test
pnpm --filter cli test
pnpm --filter adapters test

# TypeScript check
pnpm --filter web typecheck
pnpm --filter cli typecheck

# Production build
pnpm --filter web build
```

## Testing

- **Unit/Integration**: Vitest. Run per-package. ~340 tests total (web 165, CLI 50, adapters 125).
- **E2E**: Playwright in `apps/web/e2e/`. Requires production build first. ~70 scenarios.
- **Property-based**: fast-check for adapter idempotency in `packages/adapters`.

## Adding a New IDE Adapter

1. Create `packages/adapters/src/<ide-id>.ts`
2. Extend `BaseAdapter` for standard config paths + MCP apply. Use custom logic for non-standard formats (YAML, TOML, delimiters).
3. Add capabilities in `packages/adapters/src/target-capabilities.ts`
4. Add to `UNSORTED_TARGET_OPTIONS` in `apps/web/src/lib/targets.ts`
5. Add a test in `packages/adapters/src/<ide-id>.test.ts`
6. Add an SVG icon to `apps/web/public/targets/<ide-id>.svg` (white fill for dark theme)

## Conventions

- TypeScript strict mode — no `any` without explicit reason
- English-only UI copy
- Tailwind for styling — no CSS modules
- Server Components by default; `"use client"` only when needed
- Drizzle ORM for all DB access — no raw SQL except migrations
- Run `pnpm --filter web typecheck` before pushing

## Pull Requests

1. Fork and create a feature branch
2. Add tests for new functionality
3. Ensure all existing tests pass
4. Run `pnpm --filter web typecheck`
5. Open a PR with a clear description

## Questions?

Open a [GitHub Discussion](https://github.com/vibebasket/vibebasket/discussions) or an issue.
