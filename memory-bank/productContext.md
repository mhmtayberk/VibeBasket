# Product Context

## Problem
The competitor landscape (like Smithery) installs one-server-at-a-time to one-client-at-a-time, requires an account, and lacks shareable bundle URLs. No tool currently solves the multi-MCP × multi-skill × multi-IDE × shareable-link problem in one shot.

## Solution
VibeBasket fills this gap. Users pick their desired integrations on the website, get a single link/command, and execute it locally to configure everything at once securely.

## User Experience Goals
- One-click configuration.
- No mandatory accounts (Phase 1).
- Premium, dark-mode (or togglable) web UI.
- Secure handling of secrets (only typed locally during the CLI execution).
- Catalog trust and freshness should come from official or explicitly curated sources, not endless manual entry.
- Large catalogs should still feel controlled and browseable rather than infinite and sloppy.
- Mobile-responsive with floating action button and bottom sheet for basket interaction.
- "Who is this for" and "How it works" sections clearly communicate value to new visitors.
- FTS5 full-text search with prefix-matching so partial queries return relevant results.
- Admin panel for operational visibility: sync, backups, FTS5 health, DB maintenance, user management.
