# Progress

## Completed
- Defined project spec and architecture.
- Initialized monorepo configuration (package.json, pnpm-workspace.yaml, tsconfig.base.json, biome.json).
- Implemented `@vibebasket/core` (Zod schemas).
- [x] Monorepo Infrastructure (pnpm)
- [x] Core Manifest Validation (Zod)
- [x] IDE Adapters (Cursor, VSCode, Windsurf, Antigravity)
- [x] Web Dashboard UI (Tailwind v4, Shadcn)
- [x] Responsive Design & Mobile Optimization
- [x] SEO Meta Tags Enhancement
- [x] Backend APIs (Catalog, Bundle Management)
- [x] CLI Core Architecture
- [x] CLI `apply` command logic
- [x] CLI Interactive Secrets Prompt
- [x] ESM/Build stabilization across monorepository and hide private directories via `.git/info/exclude`.
- Scaffolded Next.js 15 Web Application (`apps/web`).
- Integrated Tailwind v4 and Shadcn UI (OLED Dark Mode Minimal Design).
- Resolved Node.js v20.20.1 / pnpm v11 compatibility by downgrading to pnpm v9.
- Resolved Next.js Turbopack PostCSS issues via `.npmrc` hoisting configuration.
- Implemented Web Application UI/UX (OLED Dark Mode, Bento Grid Catalog, Floating Basket, Zustand Store).
- Integrated Drizzle ORM and LibSQL (SQLite) into `@vibebasket/core`.
- Implemented `/api/catalog` and `/api/bundle` (POST/GET) endpoints.
- Seeded the database with initial catalog metadata.
- **Milestone: First major commit (feat: stabilize monorepo and implement core CLI & Web features)**.
- Resolved all ESM/TypeScript build issues.
- CLI `apply` command verified with dry-run and secret resolution.
- Fixed catalog loading failures related to DB path resolution and local dev origin handling.
- Implemented live trusted-source registry sync for official MCP and skills sources.
- Added source-isolated sync behavior so upstream failures degrade gracefully.
- Expanded the catalog from seed-scale data to large real datasets.
- Fixed visible selection state and unselect behavior in the catalog UI.
- Added server/client pagination for the catalog browsing experience.
- Added runtime DB indexes and a single-flight sync guard for catalog reads.
- Updated project docs and memory to reflect the current catalog architecture.
- Redesigned the homepage and builder experience to align much more closely with the Stitch reference system.
- Reworked the basket UX into a desktop side panel plus mobile floating entry point.
- Stopped stale catalog reads from synchronously blocking on full registry refreshes.
- Added a proper target metadata layer so UI target chips and backend bundle validation stay aligned.
- Reduced hero headline scale and introduced a scrolling target marquee for a more polished first fold.
- Added a lightweight fragmented noise treatment to the global background.
- Prevented long basket selections from dominating the layout by summarizing counts and collapsing overflow.
- Expanded the visible target ecosystem list to include more current AI IDEs and agent CLIs while keeping bundle generation restricted to adapter-backed targets.
- Promoted Claude Code, Zed, Gemini CLI, Junie, Kiro, and Cline CLI from watchlist-only visibility into real adapter-backed bundle targets.
- Added a Codex CLI adapter and closed the project-scope path propagation bug in the CLI apply flow.

## In Progress
- Improving registry persistence performance for very large sync runs.
- Auditing remaining gaps between manifest capabilities and installer support.
- Verifying the redesigned surface across more browsers and viewports once a stable screenshot workflow is available.

## Blockers
- None at the moment.
