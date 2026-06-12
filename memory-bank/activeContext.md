# Active Context

## Current State (June 12, 2026)

- **23 IDE Adapters**: Full coverage across Cursor, Windsurf, VS Code, Antigravity, Claude Code, DeepSeek-TUI, Zed, Codex CLI, Gemini CLI, Junie, Kiro, Cline CLI, Continue, Roo Code, Hermes, OpenClaw, GitHub Copilot, Void Editor, Aider, Cortex Code, Goose, IBM Bob, CodeBuddy. 11 support skills auto-apply. 4 support rules (Cursor, Roo Code, GitHub Copilot, Void Editor).

- **Catalog Detail View**: Each catalog card has a "Details →" button opening a responsive modal with trust tier, source provenance, install command (MCP), GitHub repo info (skills), and freshness data.

- **Trust System**: Simplified to pure 3-tier (Verified/Official/Community) without arbitrary numeric scores.

- **Bundle Preview**: Basket panel shows item count, target count, and warns about incompatible targets before generating the install command.

- **Cross-Target Capability Handling**: CLI warns and continues when some targets don't support all selected content. Web UI shows incompatible target warnings.

- **Backup & Storage**: 6 backends (Local, S3, R2, Spaces, Azure, GCS). AES-256-GCM encrypted credentials. Scheduled backups with admin panel UI.

- **Rate Limiting**: Sliding window on 9 endpoints. Retry-After header on 429 responses.

- **Middlelware**: Global CSRF protection via Origin validation. Security headers (CSP in production, X-Frame-Options, X-Content-Type-Options) applied globally.

- **CLI**: 6 commands — apply, init, doctor, rollback, list (new), search (new).

- **Test Coverage**: 187 tests (93 web + 4 CLI + 90 adapters). TypeScript strict mode, zero errors.

## Next Steps
- CLI `prune` command.
- Mobile responsive improvements.
- Search improvements (FTS5, typo tolerance).
- Adapter base class extraction.
- E2E test suite.

## Considerations
- **CSP**: Production-only. Dev bypasses for Turbopack.
- **Bundle TTL**: Anonymous 48h, registered 365d.
- **DB**: WAL mode, 15 indexes, .gitignore for *.db files.
- **Middleware**: Origin validation on POST/PATCH/DELETE/PUT.
