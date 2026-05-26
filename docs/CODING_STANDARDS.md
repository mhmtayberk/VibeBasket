# Coding Standards

1. **TypeScript**: Strict mode enabled.
2. **Linting**: Biome is the source of truth for formatting and linting.
3. **Data Validation**: Zod must be used for any data moving across boundaries (Web API, CLI arguments).
4. **Testing**: Vitest for unit tests. TDD is preferred for Adapters.
5. **No Any**: Do not use `any` or `as` casts without a strong reason. Boundary-layer exceptions should stay small and obvious.
6. **Documentation**: Update `docs/` and `memory-bank/` whenever architecture, behavior, or current state meaningfully changes.
7. **Catalog Performance**: Avoid UI patterns that fetch or render the full catalog when page-based access is enough.
8. **Sync Resilience**: Registry ingestion must isolate source failures and prefer degraded service over total catalog outage.
9. **Trust Model**: New upstream catalog sources should be explicit, reviewable, and treated as trusted/community layers rather than silently merged.
10. **Idempotent Writes**: IDE adapter rule/skill writes must use `>>> VIBEBASKET START: id <<<` / `>>> VIBEBASKET END: id <<<` block delimiters so VibeBasket-managed content can be updated in-place without corrupting surrounding developer configuration.
11. **Upstream Deduplication**: When ingesting from registries that publish multiple versions of the same logical server, keep only the highest semver release. Never let version proliferation create duplicate catalog cards for the same logical item.
