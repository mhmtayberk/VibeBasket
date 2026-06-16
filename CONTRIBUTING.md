# Contributing to VibeBasket

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- Git

## Setup

```bash
git clone https://github.com/vibebasket/vibebasket.git
cd vibebasket
cp .env.example .env
pnpm install
```

## Project Structure

```
apps/
  web/          Next.js 16 App Router — catalog UI and API
  cli/          Node.js CLI — apply, list, search, doctor, init, rollback
packages/
  core/         Shared DB schema, bundle manifest types, SQLite client
  adapters/     24 IDE adapters (16 on BaseAdapter, 8 custom)
  registry/     Catalog sync engine — merges verified + upstream sources
```

## Development

```bash
pnpm --filter web dev          # Start web app
pnpm --filter web test         # Run web tests
pnpm --filter @vibebasket/cli dev
pnpm --filter @vibebasket/cli test
pnpm --filter @vibebasket/adapters test
pnpm --filter web typecheck    # TypeScript check for the web app
pnpm --filter web build        # Production build
pnpm verify:ci                 # Main release gate used in CI
```

## Testing

- **Unit/Integration**: Vitest across web, CLI, and shared packages.
- **E2E**: Playwright in `apps/web/e2e/`. Requires a production build first.
- **Property-based**: fast-check for adapter idempotency in `packages/adapters`.

Important note:

- The current CI gate is `pnpm verify:ci`, not a monorepo-wide `tsc -b`.
- There is still strictness and test-fixture cleanup to finish in `packages/adapters`, so avoid claiming that the whole workspace passes a single global typecheck gate unless you verified it explicitly.

## Adding an IDE Adapter

1. Create `packages/adapters/src/<ide-id>.ts`
2. Extend `BaseAdapter` for standard config paths and MCP apply. Use custom logic for YAML, TOML, or delimiter-based formats.
3. Add capabilities in `packages/adapters/src/target-capabilities.ts`
4. Register in `UNSORTED_TARGET_OPTIONS` in `apps/web/src/lib/targets.ts`
5. Export from `packages/adapters/src/index.ts`
6. Add a test in `packages/adapters/src/<ide-id>.test.ts`
7. Add an SVG icon to `apps/web/public/targets/<ide-id>.svg` (white fill for dark theme)

## Conventions

- TypeScript strict mode. Avoid `any` without explicit reason.
- English-only UI copy.
- Tailwind for styling. No CSS modules.
- Server Components by default. `"use client"` only when interactivity is required.
- Drizzle ORM for database access.
- Run `pnpm --filter web typecheck` before pushing.

## Pull Requests

1. Fork and create a feature branch
2. Add tests for new functionality
3. Ensure all existing tests pass
4. Run `pnpm verify:ci`
5. Open a PR with a clear description

Use the pull request template and call out any manual browser, CLI, or self-hosting checks you ran.
