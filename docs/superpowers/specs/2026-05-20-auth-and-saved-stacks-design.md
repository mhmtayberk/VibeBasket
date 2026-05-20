# VibeBasket Auth And Saved Stacks Design

## Goal

Add a first-party authentication and profile system to VibeBasket so users can sign in with GitHub, Google, or Apple, then save and reuse named basket configurations ("stacks") inside their own account.

The design must support both:

1. VibeBasket-hosted SaaS on the primary domain
2. Self-hosted company deployments with minimal vendor lock-in

## Product Scope

Authenticated users can:

- sign in with GitHub
- sign in with Google
- sign in with Apple when the deployer has configured Apple correctly
- view their profile/session state
- create a saved stack from the current basket
- list previously saved stacks
- reopen a saved stack into the basket
- rename or delete saved stacks

Out of scope for the first iteration:

- teams / organizations
- shared stacks between users
- billing / entitlements
- role-based admin UI
- password/email auth
- passkeys
- real-time collaboration

## Recommended Auth Foundation

Use `Auth.js` in the Next.js app with database-backed sessions and first-party persistence.

Why this is the right fit:

- low vendor lock-in
- open source and widely used
- native support for GitHub, Google, and Apple providers
- works well with Next.js App Router
- allows self-hosters to keep their own database and identity-provider credentials
- keeps the user/session/account model inside the app instead of depending on a hosted auth vendor

We are explicitly not choosing a hosted auth platform such as Clerk, Auth0, or Supabase Auth for the first version because that would increase vendor coupling for self-hosters.

## Deployment Model

### Hosted VibeBasket

The VibeBasket primary deployment enables:

- GitHub
- Google
- Apple

All three providers are visible in the sign-in UI when configured.

### Self-Hosted VibeBasket

Self-hosted deployments can enable any subset of providers via environment variables and secrets.

Required principle:

- the app must work if only one provider is configured
- the app must work if Apple is not configured
- provider buttons must only render when the provider is enabled and correctly configured

This prevents Apple setup from becoming a blocker for self-hosters.

## Apple Sign-In Constraint

Apple web sign-in is supported, but must be treated as optional configuration for self-hosters.

Reason:

- Apple web auth requires additional Apple Developer setup such as a Services ID and allowed return URLs/domains
- some self-hosters will not have the Apple prerequisites or will not want the operational overhead

Design rule:

- Apple is a supported provider
- Apple is never assumed to exist
- the UI must not show an Apple sign-in option unless Apple config is present and enabled

## Session Strategy

Use database sessions instead of JWT-only sessions.

Why:

- easier revocation
- simpler future expansion to account/device/session management
- better operational fit for an app with persistent user-owned data
- clearer self-hosted auditability

JWT-only sessions remain a possible future optimization, but are not the recommended default for this product phase.

## Database Strategy

Use Drizzle-managed application tables in the same database layer already used by the app.

Default deployment modes:

- local/dev/small self-host: SQLite / LibSQL-compatible path
- recommended production growth path: PostgreSQL

Design principle:

- keep the schema portable
- do not hard-code Vercel-only or hosted-DB-only assumptions

## Data Model

### Auth Tables

Add the standard Auth.js persistence model:

- `users`
- `accounts`
- `sessions`
- `verification_tokens`

Likely user fields:

- `id`
- `name`
- `email`
- `emailVerified`
- `image`
- `createdAt`
- `updatedAt`

### Product Tables

Add first-party application tables:

#### `saved_stacks`

- `id`
- `userId`
- `name`
- `description` nullable
- `createdAt`
- `updatedAt`
- unique constraint on `(userId, name)` for a clean user experience

#### `saved_stack_items`

- `id`
- `stackId`
- `catalogItemId`
- `catalogItemType`
- `snapshotDisplayName`
- `snapshotDescription` nullable
- `position`
- `createdAt`

#### `saved_stack_targets`

- `id`
- `stackId`
- `targetId`
- `position`

This keeps the saved stack faithful to the user's intended target IDE set.

## Saved Stack Modeling Choice

Use `catalogItemId` as the primary reference, but also store lightweight snapshot metadata.

Why:

- the live catalog remains the source of truth
- old stacks can still render meaningfully if a catalog item changes label or disappears
- we can warn the user when a saved stack references an item that no longer exists in the current catalog

This is the best balance between correctness and resilience.

## Ownership And Access Rules

Every saved stack operation is user-scoped.

Rules:

- users can only read their own stacks
- users can only create stacks under their own identity
- users can only update/delete their own stacks
- all mutations must re-check the authenticated session on the server

Never trust client-provided ownership identifiers.

## API / Server Surface

Planned authenticated server behavior:

- `GET /api/stacks` -> current user's saved stacks
- `POST /api/stacks` -> create new stack from basket payload
- `GET /api/stacks/:id` -> fetch one owned stack
- `PATCH /api/stacks/:id` -> rename/update description
- `DELETE /api/stacks/:id` -> delete owned stack

Server-side validation must enforce:

- valid target IDs
- valid catalog item IDs
- minimum one item for save
- stack belongs to session user

## UX Design

### Header / Global Auth Entry

Add a right-side auth surface in the existing top bar:

- signed out: `Sign in`
- signed in: avatar / user menu

Menu entries:

- `My Stacks`
- `Sign out`

Later additions can include profile/settings without changing the first layout too much.

### Sign-In Experience

Use a compact modal or panel that matches the current VibeBasket aesthetic:

- dark, minimal, technical
- one button per enabled provider
- no dead provider buttons
- short trust copy, not marketing-heavy

Buttons:

- `Continue with GitHub`
- `Continue with Google`
- `Continue with Apple` when enabled

### Basket Integration

Inside `Ready to bundle`:

- if signed out: `Sign in to save this stack`
- if signed in: `Save stack`

Save flow:

1. user clicks `Save stack`
2. modal asks for stack name and optional description
3. current basket items + selected targets are persisted
4. success toast confirms save

### Saved Stacks Experience

Provide a first-pass `My Stacks` view that allows:

- list stacks
- inspect stack item count and target count
- open/load into basket
- rename
- delete

This should feel like a practical utility view, not a social profile page.

## Security Requirements

### Auth

- secrets only on the server
- secure cookies
- CSRF-protected auth flows through Auth.js
- strict callback / redirect validation
- no provider shown unless configured

### Data Ownership

- all stack routes require server-authenticated session
- ownership checks on every read/write/delete
- no stack access by guessed ID alone

### Input Validation

- Zod validation for stack create/update payloads
- enforce item and target arrays on the server
- reject unsupported targets
- reject empty stack creation

### Self-Host Guidance

Document:

- HTTPS strongly recommended for production
- cookie/session behavior behind reverse proxies
- Apple configuration caveats
- provider secret management

## Performance Considerations

- fetch auth session on the server where possible
- avoid waterfall client auth bootstrapping on core pages
- keep stack list queries indexed by `userId` and `updatedAt`
- keep saved stack payloads small by storing lightweight snapshots instead of full copied manifests
- avoid unnecessary session reads inside deeply nested client components

## SEO / Public Experience

The homepage remains publicly usable without login.

Rules:

- the catalog stays browseable while signed out
- auth gates only apply to saved stack features
- no auth wall on the main product value

This preserves discoverability and keeps SEO/public product access intact.

## Self-Host Configuration Model

Planned env-style configuration:

- `AUTH_SECRET`
- `AUTH_TRUST_HOST` or equivalent host-validation config
- `AUTH_GITHUB_ENABLED`
- `AUTH_GITHUB_CLIENT_ID`
- `AUTH_GITHUB_CLIENT_SECRET`
- `AUTH_GOOGLE_ENABLED`
- `AUTH_GOOGLE_CLIENT_ID`
- `AUTH_GOOGLE_CLIENT_SECRET`
- `AUTH_APPLE_ENABLED`
- `AUTH_APPLE_CLIENT_ID`
- `AUTH_APPLE_CLIENT_SECRET`
- `AUTH_APPLE_TEAM_ID`
- `AUTH_APPLE_KEY_ID`
- `AUTH_APPLE_PRIVATE_KEY`

Provider availability should be derived from both:

1. explicit enable flags
2. presence of required credentials

## Testing Strategy

### Unit Tests

- provider availability gating
- stack payload validation
- target validation
- ownership guard helpers
- saved stack mapping from basket state

### Integration Tests

- create stack while authenticated
- reject create while unauthenticated
- list only current user's stacks
- rename owned stack
- reject rename/delete for foreign stack
- load saved stack with targets intact

### E2E Tests

- sign-in entry visibility
- mocked sign-in flow
- save stack from basket
- revisit and reload stack
- delete stack

### Edge Cases

- provider disabled
- Apple disabled, GitHub enabled
- duplicate stack name for same user
- same stack name across different users
- saved stack references removed catalog item
- empty basket save attempt
- stale session during mutation

## Failure Handling

If a saved stack contains missing catalog items:

- show the stack
- mark missing items clearly
- allow user to continue loading the valid subset
- do not silently drop missing items without telling the user

If a provider is misconfigured:

- hide it from the UI
- log a clear server warning in development
- do not break the entire sign-in screen

## Migration / Rollout Strategy

Recommended order:

1. add auth foundation and schema
2. wire session access into the app shell
3. add saved stack tables and server actions/routes
4. add sign-in UI
5. add basket save flow
6. add `My Stacks` UI
7. add automated tests
8. update docs for SaaS + self-host setup

## Open Decisions Already Resolved

- **Auth framework:** Auth.js
- **Vendor lock-in posture:** low, first-party DB persistence
- **Apple support:** supported, but optional in self-host
- **Session strategy:** database sessions
- **Saved stack storage model:** reference live catalog IDs plus lightweight snapshot metadata
- **Anonymous usage:** allowed for catalog browsing and bundle generation

## Implementation Risk Notes

Highest-risk areas:

1. Apple provider setup complexity for self-hosters
2. clean App Router auth integration without adding client-side thrash
3. making saved stacks resilient when catalog entries evolve

The architecture above keeps those risks contained without pushing the project into a hosted-auth dependency.
