# Security Policy

## Threat Model

### Secrets Management
- Bundle manifests never carry end-user runtime secrets. They contain only `${secret:NAME}` placeholders.
- VibeBasket CLI resolves secrets locally using environment variables, `.env` files, or the OS keychain (`keytar`).
- The hosted web app may store administrator-configured backup-storage credentials, but those values are encrypted at rest before they are written to SQLite.
- Bundles are public by URL. Never include sensitive data in manifests.

### Immutable Bundles
- Bundles are immutable once created. Any change produces a new ID.
- This prevents "bait and switch" attacks where a bundle URL's content is changed after sharing.

### Verified Registry
- Hand-curated items in `verified.yaml` go through manual review.
- Community-ingested items are marked in the UI.

### Rate Limiting
- Sliding-window rate limiting on 8 API endpoints with `Retry-After` headers.
- In-memory Map with garbage-collection sweeper prevents memory leaks.

Operational note:

- The current limiter is process-local. That is acceptable for a single-node deployment, but horizontally scaled production deployments should still rely on edge or proxy-layer rate limiting in front of the app.

### Storage Encryption
- Cloud storage credentials (S3, R2, Azure, GCS, Spaces) encrypted with AES-256-GCM.
- Encryption key derived from `AUTH_SECRET` via `scryptSync`.
- Credentials stored in SQLite, never in environment files or plaintext.

### Input Sanitization
- File operations use `path.basename()` with character whitelists.
- FTS5 search queries use parameterized SQL.
- Route parameters are whitelist-validated and length-capped against LFI/ReDoS.
- Bundle creation payloads capped at 100KB.

## Reporting a Vulnerability

**Do not open a public issue.** Report vulnerabilities privately via [GitHub Security Advisories](https://github.com/vibebasket/vibebasket/security/advisories/new).

We will acknowledge your report within 48 hours and provide a timeline for resolution.

If GitHub private advisories are unavailable, contact the maintainers through the primary repository contact channel and include `[security]` in the subject.

## Supported Versions

- `main`: supported
- latest tagged release: supported
- older releases: best effort unless explicitly stated otherwise

## Scope

In scope:
- the open-source repository and documented self-hosted deployment paths
- the hosted web application behavior described in this repository

Out of scope:
- vulnerabilities inside third-party MCP servers, skills, or IDEs installed by users
- secrets intentionally embedded into public bundle metadata by end users

## Security Scanning

- GitHub Actions CI verifies the main build and test surface on pushes and pull requests.
- CodeQL is enabled for JavaScript/TypeScript analysis.
- Dependabot is configured for npm dependencies and GitHub Actions updates.
