# Security Policy

VibeBasket takes security seriously. This document outlines our threat model and the process for reporting security vulnerabilities.

## Threat Model

### Secrets Management
- **VibeBasket Web** never sees or stores your secrets. Manifests contain only `${secret:NAME}` placeholders.
- **VibeBasket CLI** resolves secrets locally on your machine using environment variables, local `.env` files, or the OS keychain (`keytar`).
- **Bundles** are public by URL. Do **NOT** include any sensitive data in the manifest beyond placeholders.

### Immutable Bundles
- Bundles are immutable once created. Any change to a bundle results in a new ID.
- This prevents "bait and switch" attacks where a bundle URL's content is changed after it has been shared.

### Verified Registry
- Hand-curated items in `verified.yaml` go through manual review.
- Community-ingested items are marked with a warning in the UI.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately to the maintainers. Do not open a public issue.

You can report vulnerabilities by sending an email to: security@vibebasket.dev (Placeholder)

We will acknowledge your report within 48 hours and provide a timeline for resolution.

## Security Scanning

- We use **CodeQL** for automated security scanning on every pull request.
- We use **Dependabot** to keep our dependencies up to date.
