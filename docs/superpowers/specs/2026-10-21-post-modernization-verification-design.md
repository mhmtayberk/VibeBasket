# Post-modernization verification design

## Scope

Verify the merged modernization work without broadening the product surface. Correct only stale target-count documentation, constrain dependency-update automation, audit repository hygiene, and prove that every advertised target uses the expected MCP, skill, and rule installation contract.

## Changes

- Replace remaining documentation-only references to 24 supported targets with 30 across the root README and all six web locales.
- Keep the npm CLI README unchanged unless verification finds an inaccurate statement.
- Run Dependabot version updates monthly against `main`, group routine updates, and cap open pull requests. Dependabot must never auto-merge.
- Enable read-only Dependabot vulnerability alerts, but leave automatic security-update pull requests disabled so security findings remain visible without unbounded CI activity.
- Preserve the intentional `main` and `dev` branches, remove no branch without evidence, and enable automatic deletion of merged temporary branches.
- Add focused contract coverage only where the existing suite does not prove registry parity, supported scopes, safe managed writes, and target-native configuration shapes.

## Verification

- Full lint, typecheck, build, and unit/integration/property suite.
- Full Playwright suite and locale-specific documentation checks.
- Isolated CLI installation matrix for every supported target and advertised content type, including repeat-apply/idempotency checks.
- npm tarball inspection, local MCP stdio handshake/tool call, Docker build/runtime smoke test, and final GitHub CI/security review.

## Release boundary

The maintenance pull request does not publish a new npm version or deploy production. Those remain explicit release operations after the repository change is reviewed and merged.
