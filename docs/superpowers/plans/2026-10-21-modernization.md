# VibeBasket 2026 Modernization Implementation Plan

**Goal:** Reconcile repository maintenance, safely update dependencies, correct stale adapter contracts, and expand the verified target matrix without weakening VibeBasket's backup, idempotency, or verification guarantees.

**Architecture:** Keep target identity and capability metadata centralized in core/adapters, use target-native serializers only where schemas diverge, and make CLI guidance, inspection, web metadata, documentation, and tests follow the same source of truth. Deliver one auditable implementation on `codex/modernization-2026` after every local and remote gate passes.

**Tech stack:** pnpm workspace, TypeScript, Zod, Vitest, Next.js 16, Playwright, Docker, GitHub Actions

---

## Task 1: Capture the maintenance baseline

- [x] Inventory open PRs, branches, mergeability, and checks.
- [x] Map existing dirty package changes to Dependabot PRs without overwriting them.
- [x] Record current npm, website health, catalog status, Docker, CLI, and test baselines.
- [x] Diagnose failing CodeQL action-update checks.

## Task 2: Correct high-confidence existing adapter drift

- [x] Convert `vscode` from legacy Cline storage to native VS Code MCP configuration.
- [x] Add GitHub Copilot project MCP support without regressing instruction-file support.
- [x] Verify OpenCode's current native top-level `mcp` schema and correct stale guidance.
- [x] Verify Windsurf/Devin's preferred `.devin/rules` path and document its fallback.
- [x] Recheck all other adapter paths and lower capabilities when evidence is insufficient.
- [x] Add migration-tolerant reads where old VibeBasket output may already exist.

## Task 3: Admit verified new targets

- [x] Add Ante user-scoped MCP adapter.
- [x] Add Trae project-scoped MCP adapter.
- [x] Add Qoder user/project MCP adapter.
- [x] Add OMP user/project MCP adapter.
- [x] Add Autohand user/project MCP adapter with array-aware merging.
- [x] Add Crush user/project adapter using safely managed `crushrc` blocks.
- [x] Defer Auggie, DeepSeek Harness, Orca, Codebuff, and Freebuff unless a stable client-writer contract is proven.
- [x] Update core schema, registry, CLI services, snippets, inspection, web target metadata, and target counts.

## Task 4: Test target behavior and edge cases

- [x] Cover missing, malformed, empty, and unrelated existing config.
- [x] Cover force/no-force collisions and remote/stdio conversion.
- [x] Cover paths on Unix, macOS, and Windows where adapters branch by platform.
- [x] Verify repeat apply is a no-op and does not create redundant backups.
- [x] Verify doctor/readback and rollback for each new serialization family.
- [x] Verify project roots with spaces and MCP IDs requiring safe quoting.

## Task 5: Modernize dependencies in risk groups

- [x] Reconcile the existing Dependabot-derived package changes.
- [x] Apply compatible patch/minor updates and inspect release notes.
- [x] Evaluate majors separately; defer any migration that lacks a strong payoff and full proof.
- [x] Update GitHub Actions together where coupled, especially CodeQL init/analyze.
- [x] Refresh the lockfile once per accepted dependency set.
- [x] Run audit and package-content checks.

## Task 6: Update documentation and product surfaces

- [x] Update README supported-target table and counts.
- [x] Add a durable modernization audit with architecture and compatibility decisions.
- [x] Update CLI/MCP target guidance and native snippets.
- [x] Update website target cards, notes, icons/fallbacks, and localized count-bearing copy.
- [x] Document researched but deferred targets and exact reasons.

## Task 7: Run the full release gate

- [x] Lint/format and all workspace typechecks.
- [x] All unit, integration, property, and round-trip tests.
- [x] All package and Next.js production builds.
- [x] CLI pack/install/command and local MCP stdio smoke tests.
- [x] Install the matching Playwright browser and run API/browser E2E.
- [x] Build and run the production Docker image as non-root with persistence and health checks.
- [x] Exercise apply/reapply/doctor/backup/rollback in temporary homes/projects.

## Task 8: Reconcile GitHub and publish the result

- [ ] Push the modernization branch and open a pull request against the verified integration base.
- [ ] Wait for every required remote check and repair failures.
- [ ] Merge only after local and remote gates agree.
- [ ] Close superseded Dependabot PRs with traceable explanations.
- [ ] Remove only merged/superseded remote branches.
- [x] Recheck the live site and npm package; keep publication behind the tagged release workflow.
