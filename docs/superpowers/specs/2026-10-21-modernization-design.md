# VibeBasket 2026 Modernization Design

Date: 2026-10-21
Status: Approved

## Objective

Modernize VibeBasket without weakening its current safety guarantees. The work is split into four independently reviewable tracks:

1. Audit and reconcile open GitHub pull requests and branches.
2. Update dependencies according to measured compatibility risk.
3. Add well-documented agentic IDE and CLI targets.
4. Revalidate every existing adapter against current first-party configuration documentation.

The public website, published CLI, local MCP server, bundle schema, deployment images, and repository history are all part of the compatibility surface.

## Safety invariants

- Preserve pre-existing worktree changes and identify their provenance before editing overlapping files.
- Never advertise a target capability that the adapter cannot apply and verify.
- Preserve unknown user configuration, comments where the native format permits it, and unrelated keys.
- Keep writes idempotent. A second identical apply must not create a backup or alter the file.
- Create a recoverable backup before every material target-config mutation.
- Re-read written files and verify target-native content rather than trusting a successful write call.
- Never place unresolved or real secrets in generated fixtures, documentation, logs, bundles, or commits.
- Treat project-scoped configuration as untrusted until the user has chosen to apply it.
- Do not close a superseded PR or delete its branch until the replacement is committed, pushed, and green.
- Do not merge a failing, ambiguous, or stale PR merely because the change is automated.

## Delivery strategy

Use one modernization branch with four scoped commit groups. This keeps cross-cutting schema and documentation changes testable together while retaining review and rollback boundaries. GitHub cleanup is performed only after the replacement branch is green.

### Track 1: GitHub reconciliation

For every open pull request, record its dependency/action, age, base/head, mergeability, checks, security signal, overlap with the modernization branch, and disposition.

- Merge a PR directly only when it is independent, current, clean, and fully green.
- Reproduce package updates in the consolidated dependency commit when several lockfile changes overlap.
- Diagnose the two failing CodeQL-action PRs before deciding whether to supersede or repair them.
- Close superseded Dependabot PRs with an explanatory comment after the replacement is available.
- Delete only merged or conclusively superseded remote branches.
- Preserve `main` and `dev`; determine the repository's actual release flow before choosing the pull-request base.

### Track 2: Dependency modernization

Classify upgrades instead of applying `latest` indiscriminately:

- Patch/minor: update in coherent ecosystem groups, inspect release notes, then run the full gate.
- Major: isolate and accept only when migration notes, source compatibility, and tests justify it.
- Runtime/toolchain: verify the Docker Node version, package `engines`, CI actions, pnpm version, and npm package contents together.
- Browser tooling: install the matching Playwright browser before treating E2E results as meaningful.

Major candidates such as Biome 2, Zod 4, TypeScript 7, Vitest 5, Chalk 6, cloud-storage SDK majors, and tsup 9 do not enter the baseline update without a dedicated migration proof. A newer version number alone is not sufficient.

### Track 3: New target admission

A target is supported only if first-party or authoritative source evidence establishes a stable user-facing configuration surface and VibeBasket can implement deterministic write, merge, backup, rollback, and readback verification behavior.

Initial candidates:

| Candidate | Expected disposition | Evidence required |
| --- | --- | --- |
| Ante | Adapter candidate | `~/.ante/settings.json`, stdio MCP schema, user scope |
| Trae | Adapter candidate | `.trae/mcp.json`, project MCP enablement and schema |
| Qoder | Adapter candidate | user/project/local scopes and `mcpServers` schema |
| OMP | Adapter candidate | native `.omp/mcp.json` and profile-aware user path |
| Crush by Charm | Adapter candidate | current `crushrc` ownership model; avoid relying solely on deprecated JSON |
| Auggie | Adapter candidate | current CLI/global MCP persistence path and transports |
| Autohand Code | Adapter candidate | canonical config precedence and MCP server-array schema |
| DeepSeek Harness | Research/watchlist unless a stable end-user writer contract is proven | plugin-composition and scope semantics |
| Orca | Research/watchlist until the intended Orca product is unambiguous | canonical client config versus orchestrator/MCP-server role |
| Codebuff / Freebuff | Research/watchlist unless a generic client-level install surface is proven | distinguish custom-agent MCP fields from host configuration |
| Aider | Existing adapter audit | retain instruction-based support unless native MCP support is documented |

Candidates can be rejected or deferred. Honest omission is preferable to a brittle adapter.

Every admitted target must include:

- manifest ID, capability registry entry, runtime registration, and exports;
- target-native adapter with supported scopes;
- merge and serialization tests, including malformed and pre-existing configs;
- backup/no-op/rollback and post-install verification coverage;
- CLI/MCP target guidance and native snippet rendering;
- web metadata, icon treatment, localized labels/copy, counts, and docs;
- representative fixtures for stdio and supported remote transports.

## Track 4: Existing adapter audit

Build a source-of-truth matrix for all 24 current targets:

- canonical user and project paths on supported operating systems;
- current config key and serialization shape;
- stdio, HTTP, SSE, WebSocket, and header support;
- skills and rules locations and file formats;
- config precedence and trust behavior;
- whether hot reload or client restart is required;
- official verification command or observable behavior.

For every discrepancy, update the adapter, CLI inspection logic, target guidance, web documentation, and tests together. If a feature is no longer supported, reduce the advertised capability instead of preserving a false compatibility claim.

## Validation gates

Each scoped commit must pass the relevant focused tests. The final branch must pass:

1. Formatting and lint checks.
2. TypeScript checks for every workspace.
3. Unit, integration, property, and adapter round-trip tests.
4. Builds for core, adapters, registry, CLI, and Next.js.
5. CLI pack inspection and clean temporary-directory install smoke test.
6. Local MCP initialize/list/call smoke tests over stdio.
7. Playwright API and browser E2E with the matching browser binary.
8. Production Docker image build, non-root startup, health, catalog status, and persistent SQLite smoke tests.
9. Generated bundle apply, repeat apply/no-op, doctor, backup listing, and rollback across representative JSON, YAML, TOML, and instruction-file adapters.
10. Dependency audit and review of unresolved advisories or license changes.

No destructive GitHub cleanup occurs before this final gate and remote CI succeed.

## Documentation and release behavior

- Update README, architecture, project overview, setup, changelog, target counts, and localized web copy from shared metadata where possible.
- Keep the website and CLI capability language exact; distinguish supported, integration-only, and watchlist targets.
- Verify the live health and catalog endpoints after deployment, including stale-sync diagnostics.
- Publish a new CLI version only after the npm tarball contents and installed binary pass smoke tests.
- Record deferred major upgrades and rejected target candidates with reasons so future work does not repeat the same research.

## Rollback

- Git changes remain separated by track and can be reverted independently.
- Adapter writes retain timestamped backups and are validated through the existing rollback service.
- Database schema changes are out of scope unless a verified dependency migration requires them; any such change needs an explicit migration and restore rehearsal.
- A failed deployment rolls back to the previous image and persistent database volume; no cleanup step may remove the last known-good artifact.

