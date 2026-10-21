# 2026 Modernization Audit

Date: 2026-10-21

This audit records the compatibility decisions behind the 2026 repository refresh. A target is advertised only when an authoritative configuration contract can be merged, backed up, read back, and verified deterministically.

## Added targets

| Target | Supported surface | Authoritative contract |
| --- | --- | --- |
| Ante | User MCP | `~/.ante/settings.json`, `mcp_servers`, stdio and Streamable HTTP ([docs](https://docs.antigma.ai/extend/mcp/)) |
| Trae | Project MCP | `.trae/mcp.json`, project MCP opt-in, `mcpServers` ([docs](https://docs.trae.cn/ide_add-mcp-servers)) |
| Qoder | User/project MCP | `~/.qoder/settings.json` and `.mcp.json`, `mcpServers`, `QODER_CONFIG_DIR` ([docs](https://docs.qoder.com/cli/mcp-reference)) |
| OMP | User/project MCP | `~/.omp/agent/mcp.json` and `.omp/mcp.json`, schema-backed `mcpServers` ([docs](https://github.com/can1357/oh-my-pi/blob/main/docs/mcp-config.md)) |
| Autohand Code | User/project MCP | JSON config, `mcp.servers`, `AUTOHAND_CONFIG`/`AUTOHAND_HOME` ([docs](https://docs.autohand.ai/working-with-autohand-code/configuration)) |
| Crush | User/project MCP | executable `crushrc`, `mcp add`, XDG and `CRUSH_GLOBAL_CONFIG` paths ([docs](https://github.com/charmbracelet/crush/blob/main/README.md#configuration)) |

Autohand also supports TOML and YAML, but VibeBasket currently serializes its native JSON shape only. If an alternate user config is active, the adapter stops with an explanatory error instead of creating a competing file.

## Corrected existing targets

- Visual Studio Code now uses native user `mcp.json` and workspace `.vscode/mcp.json` with the `servers` key ([docs](https://code.visualstudio.com/docs/agents/reference/mcp-configuration)).
- GitHub Copilot project installs now write portable `.mcp.json` entries while preserving `.github/copilot-instructions.md` for instructions ([docs](https://docs.github.com/en/copilot/customizing-copilot/extending-copilot-chat-with-mcp)).
- Windsurf/Devin project rules retain the current preferred `.devin/rules` path; `.windsurf/rules` is documented only as a compatibility fallback ([docs](https://docs.windsurf.com/windsurf/cascade/memories#rules)).
- OpenCode retains the stable top-level `mcp` object, `.opencode/skills`, and `AGENTS.md` behavior ([docs](https://docs.opencode.ai/docs/config/)).
- Zed retains `context_servers` and Agent Skills discovery under `.agents/skills` ([docs](https://zed.dev/docs/ai/mcp)).
- Aider remains skills/rules-only because its documented client surface does not expose a native generic MCP configuration ([docs](https://aider.chat/docs/)).

## Researched and deferred targets

- DeepSeek Harness is a plugin/patch-composition framework rather than a stable end-user MCP config writer. It remains a watchlist item until its host integration contract stabilizes.
- Orca is ambiguous across products and currently overlaps orchestration/server roles; no single canonical client config was safe to target.
- Auggie did not have a sufficiently authoritative, stable persistence contract for automatic writes.
- Codebuff and Freebuff expose custom-agent concepts, but no verified generic client-level install surface met the backup/readback requirements.

## Dependency policy

Compatible patch/minor updates were accepted together and validated as one lockfile. Major upgrades were intentionally deferred when they require their own migration proof: Biome 2, Chalk 6, Google Cloud Storage 8, Node type definitions 26, dotenv 18, fast-check 4, nanoid 6, tsup 9, TypeScript 7, Vitest 5, and Zod 4. The pre-1.0 libSQL client upgrade is also isolated because minor releases may contain breaking changes.

Dependabot now groups npm patch/minor updates and all CodeQL action steps so coupled actions cannot drift to different releases. Deferred major migrations and the pre-1.0 libSQL minor line are explicitly ignored until their dedicated migration proof exists. A post-merge Dependabot run exposed that CodeQL sub-actions require the wildcard pattern `github/codeql-action/*`; the rule was corrected and both workflow steps were advanced atomically to 4.39.0.

The production audit was reduced from 49 findings (including one critical and 13 high) to zero. A post-merge Dependabot refresh identified the published `@babel/core` 7.29.6 patch, which is pinned through the workspace override. The development-only audit still records one high `braces` advisory whose reported patched version (`3.0.4`) is not published, plus one moderate and one low `esbuild` advisory behind build-time tooling. These remaining findings are recorded rather than hidden or force-resolved through unverified major overrides.

## Release evidence

The branch is gated by linting, type checking, 547 unit/integration/property tests, 121 Playwright scenarios, production package and Next.js builds, CLI tarball inspection, an MCP stdio handshake/tool call, and a non-root Docker health/database smoke test. npm publication is deliberately separate from repository modernization and still requires the normal tagged release workflow.
