# Production Readiness Checklist

Use this checklist before deploying VibeBasket on a public domain or publishing a release.

## 1. Repository Hygiene

- [ ] `README.md` matches the real product surface and supported targets
- [ ] `CONTRIBUTING.md`, `SECURITY.md`, and `CODE_OF_CONDUCT.md` are present and current
- [ ] CI passes on the target branch
- [ ] CodeQL is enabled and free of unresolved high-severity findings
- [ ] Dependabot is enabled for npm packages and GitHub Actions

## 2. Build & Verification

- [ ] `pnpm lint`
- [ ] `pnpm build:packages`
- [ ] `pnpm --filter web typecheck`
- [ ] `pnpm build:web`
- [ ] `pnpm test`
- [ ] `pnpm test:e2e`

Notes:

- The main release gate is `pnpm verify:ci`, not a monorepo-wide `tsc -b` build graph.
- `pnpm verify:ci` already includes the full workspace `pnpm typecheck`, but running `pnpm typecheck` explicitly before release tagging is still useful when you want a direct TypeScript-only signal.
- GitHub Actions should show both `CI / Verify` and `CI / E2E Smoke` green on the release branch before public deploy or tagging.

## 3. Security Baseline

- [ ] `AUTH_SECRET` is set to a strong random value
- [ ] `NEXTAUTH_URL` matches the final public domain exactly
- [ ] Any new `NEXT_PUBLIC_*` environment variable has been consciously reviewed as safe for client-side exposure
- [ ] `AUTH_TRUST_HOST=true` when deployed behind a reverse proxy
- [ ] `TRUST_PROXY=true` only when deployed behind a trusted reverse proxy that overwrites client IP headers
- [ ] Browser-originated saved-stack mutations (`POST`, `PATCH`, `DELETE`) are exercised once against the real public origin to confirm same-origin CSRF protection is not breaking normal usage
- [ ] `CATALOG_REFRESH_TOKEN` is set in production if remote refresh is used
- [ ] Only the OAuth providers you really need are enabled
- [ ] `ADMIN_OAUTH_EMAILS` contains only trusted admin accounts, and each admin account is expected to arrive with a verified email
- [ ] SQLite backups are configured and tested
- [ ] Backup backend selection is validated so the app is not silently falling back to local storage
- [ ] `BACKUP_JOB_TOKEN` is set if backup scheduling is enabled

## 4. Deployment Shape

Choose one production shape and verify it end-to-end:

### Docker / Single-node

- [ ] Volume mounted at `/data`
- [ ] `/api/health` returns `200`
- [ ] OAuth callback URLs are registered against the production domain
- [ ] Backup restore has been exercised at least once

### Kubernetes / Helm

- [ ] Single replica (`Recreate`) or an external database strategy is in place
- [ ] Ingress/TLS configuration matches `NEXTAUTH_URL`
- [ ] Secret values are injected via `existingSecret` or sealed-secret flow
- [ ] PVC persistence for `/data` is provisioned and recoverable

## 5. Catalog Integrity

- [ ] `pnpm catalog:sync:strict` completes successfully
- [ ] `/api/catalog/status` reports healthy freshness and recent successful syncs
- [ ] skills.sh official/community rows appear with correct trust labels
- [ ] Search returns relevant results for common queries such as `postgresql`, `filesystem`, and `github`
- [ ] Bundle generation and bundle apply work on at least two MCP-only targets and two skill/rule-capable targets

## 6. Operational Checks

- [ ] `/api/health` behaves correctly under repeated requests
- [ ] Admin dashboard loads and shows valid source counts and sync health
- [ ] Admin dashboard `Release Readiness` panel shows zero blockers, and any remaining warnings are consciously accepted
- [ ] If using Coolify, Cloudflare, Nginx, or Caddy in front of the app, `AUTH_TRUST_HOST` and `TRUST_PROXY` warnings are either cleared or explicitly accepted with that proxy topology in mind
- [ ] Scheduled backups run on the expected interval
- [ ] The external backup scheduler is calling `POST /api/internal/backup` with a valid `BACKUP_JOB_TOKEN`
- [ ] Logs are captured by the hosting platform and inspected for startup/runtime errors

## 7. Open-Source Launch

- [ ] Repository description, topics, homepage URL, and social preview are set on GitHub
- [ ] First-run instructions work from a fresh machine
- [ ] Example screenshots or demo media are ready
- [ ] License is correct
- [ ] Release notes or changelog entry are prepared
