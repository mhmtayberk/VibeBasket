# Active Context

## Current State

- **Catalog Detail View**: Each catalog card now has a "Details →" button that opens a responsive modal showing item metadata (trust tier, source provenance, install command for MCPs, GitHub repo info for skills, freshness). All data sourced from our own SQLite DB ingested from skills.sh and MCP Registry.

- **Trust Score Simplified**: Removed arbitrary numeric scoring (100/82/60-75). Now three pure tiers: Verified (hand-curated), Official (from official-mcp-registry or skills-sh-official), Community (all other sources). Score field removed from both CatalogTrust and BasketItemTrust types.

- **Landing Page Polish**: Badge changed from "Public beta" to "Open source · 19 IDE targets". Marquee icons unified — all 16 targets use consistent SVG files from /public/targets/. Removed simple-icons dependency (~12MB savings). Outdated "Today's apply engine..." text removed. Dead `hasNonMcpItems` variable cleaned up.

- **Security Fixes**: Health endpoint now returns proper 429 when rate-limited (was returning fake 200). ADMIN_EMAILS env var mismatch resolved (code now accepts both ADMIN_OAUTH_EMAILS and ADMIN_EMAILS). Bundle TTL: anonymous 48h, registered 365d. Expired bundles auto-cleaned.

- **CLI Docs Corrected**: Removed non-existent `--project-root`/`--yes` flags from docs. Replaced with actual flags: `--scope`/`--dry-run`.

- **Error Boundary**: `ErrorBoundary.tsx` created — reusable React error boundary with retry button.

- **Dead Code Removed**: Empty `community.json`, unused imports, dead variables.

- **DB Hardening**: `idx_bundles_expires_user` index added. `*.db` files added to `.gitignore`. Test paths made dynamic (no more hardcoded user paths).

- **Test Coverage**: 93 Vitest tests (web) + 72 (adapters) = 165 total all passing. TypeScript strict mode with zero errors.

## Next Steps
- CLI `list` and `prune` command implementation.
- VACUUM schedule for DB maintenance.

## Considerations
- **Trust System**: Pure tier-based. No misleading numeric scores. Documented in code with source provenance.
- **Bundle Lifecycle**: Anonymous 48h TTL, registered 365d. Cleanup runs every 60s on bundle fetch.
- **CSP**: Production-only. Dev mode bypasses for Turbopack compatibility.