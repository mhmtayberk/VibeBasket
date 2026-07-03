# Security Policy

## Reporting a Vulnerability

Do not open a public issue for security problems.

Report vulnerabilities privately through [GitHub Security Advisories](https://github.com/mhmtayberk/VibeBasket/security/advisories/new).

We aim to acknowledge reports within 48 hours and follow up with a remediation timeline.

## Security Model

VibeBasket is designed around a few simple rules:

- bundle manifests never carry end-user runtime secrets
- secrets needed during CLI install are resolved locally on the operator's machine
- many IDE adapters require inline env/header values in local config files, so those resolved secrets may be written to the user's local IDE config surface
- where a target has a safer native reference model for a secret field, VibeBasket prefers that model instead of serializing the raw secret value
- shared bundle URLs should be treated as public
- admin-managed backup credentials may exist in the web app, but are encrypted at rest

## What the Project Defends

- immutable bundle IDs, so a shared bundle cannot be silently changed in place
- encrypted backup-storage credentials using AES-256-GCM with a key derived from `AUTH_SECRET`; new records use a per-record random salt and IV, and legacy records remain readable during migration
- path sanitization on file operations
- bounded request payloads for bundle creation
- parameterized database access for catalog search and filtering
- rate limiting on sensitive public and admin-facing endpoints
- admin access only for allowlisted emails that the OAuth provider reports as verified

## Deployment Notes

- The documented deployment model is single-node by default.
- The built-in rate limiter is process-local and appropriate for that model.
- Multi-node deployments should enforce rate limiting at the edge or proxy layer as well.

## Scope

In scope:

- the open-source repository
- documented self-hosted deployment paths
- hosted application behavior described in this repository

Out of scope:

- vulnerabilities in third-party MCP servers, skills, or IDEs installed by users
- secrets intentionally embedded by users into public bundle metadata

## Supported Versions

- `main`
- latest tagged release

Older releases are best effort unless stated otherwise.

## Security Automation

- GitHub Actions CI verifies the main build and test surface
- GitHub Actions CI runs repository secret scanning with `gitleaks`
- GitHub Actions workflows pin third-party actions to immutable commit SHAs and pin the `gitleaks` container by digest
- new `NEXT_PUBLIC_*` variables are blocked unless they are explicitly allowlisted and reviewed
- CodeQL is enabled for JavaScript and TypeScript analysis
- Dependabot is configured for npm dependencies and GitHub Actions updates
- pnpm install policy enforces reviewed dependency build scripts, blocks exotic transitive dependency sources, and delays installs of very new registry releases
