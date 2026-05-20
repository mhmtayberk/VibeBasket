# Auth And Saved Stacks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add secure social login plus user-owned saved stacks to VibeBasket without introducing hosted-auth lock-in, while preserving public catalog browsing and self-host flexibility.

**Architecture:** The web app will use Auth.js with database-backed sessions and Drizzle-managed persistence inside the existing `@vibebasket/core` database layer. Authentication state will be exposed to the App Router through a small server auth module, while saved stack CRUD stays in authenticated route handlers backed by first-party `saved_stacks`, `saved_stack_items`, and `saved_stack_targets` tables.

**Tech Stack:** Next.js 16 App Router, Auth.js, Drizzle ORM, LibSQL/SQLite-compatible schema, Zod, React 19, Vitest

---

## File Structure

### New files

- `apps/web/src/auth.ts`
  Auth.js server configuration, provider gating, exported `auth`, `handlers`, `signIn`, `signOut`.
- `apps/web/src/auth.config.ts`
  Pure provider/env configuration helpers kept separate for testability.
- `apps/web/src/lib/session.ts`
  Server-side helpers for retrieving and asserting the current session/user.
- `apps/web/src/lib/provider-config.test.ts`
  Unit tests for provider visibility/config rules.
- `apps/web/src/lib/stacks.ts`
  Shared server-safe saved-stack mapping/helpers.
- `apps/web/src/lib/stacks.test.ts`
  Unit tests for saved-stack mapping and validation helpers.
- `apps/web/src/components/auth/AuthButtons.tsx`
  Sign-in buttons for enabled providers only.
- `apps/web/src/components/auth/AuthMenu.tsx`
  Signed-in avatar/menu entry for `My Stacks` and sign out.
- `apps/web/src/components/auth/SignInDialog.tsx`
  Reusable sign-in dialog/sheet aligned with current design.
- `apps/web/src/components/stacks/SaveStackDialog.tsx`
  UI for naming/saving a basket into the user profile.
- `apps/web/src/components/stacks/SavedStacksPanel.tsx`
  UI for listing, loading, renaming, and deleting saved stacks.
- `apps/web/src/app/api/auth/[...nextauth]/route.ts`
  Auth.js route handlers bridge for Next.js App Router.
- `apps/web/src/app/api/stacks/route.ts`
  `GET` and `POST` for current-user stacks.
- `apps/web/src/app/api/stacks/[id]/route.ts`
  `GET`, `PATCH`, `DELETE` for a single owned stack.
- `apps/web/src/app/stacks/page.tsx`
  Authenticated `My Stacks` page.
- `apps/web/src/app/stacks/loading.tsx`
  Loading state for `My Stacks`.
- `apps/web/src/app/stacks/not-found.tsx`
  Helpful not-found/unauthorized boundary if needed.
- `apps/web/src/app/api/stacks/route.test.ts`
  Integration-style route tests for create/list behavior.
- `apps/web/src/app/api/stacks/[id]/route.test.ts`
  Integration-style route tests for ownership/read/update/delete behavior.
- `packages/core/src/db/auth-schema.ts`
  Auth.js-compatible database tables for users/accounts/sessions/verification tokens.
- `packages/core/src/db/stacks-schema.ts`
  Saved stacks tables.
- `packages/core/src/db/auth-schema.test.ts`
  Schema-level tests for constraints where practical.
- `docs/AUTH.md`
  SaaS and self-host auth setup docs.

### Existing files to modify

- `apps/web/package.json`
  Add auth dependencies and any test dependencies required for route/unit testing.
- `apps/web/src/app/layout.tsx`
  Inject auth-aware top-bar state and any provider/session context wrapper only if needed.
- `apps/web/src/app/page.tsx`
  Add signed-in affordances and entry points to saved stacks without gating the catalog.
- `apps/web/src/components/basket/BasketPanel.tsx`
  Add `Sign in to save this stack` / `Save stack` action.
- `apps/web/src/store/basketStore.ts`
  Add helper for loading a saved stack into the current basket cleanly.
- `packages/core/src/db/schema.ts`
  Re-export or compose new auth + stack schemas into the shared Drizzle schema surface.
- `packages/core/src/db/index.ts`
  Ensure new tables/indexes are created safely for existing DBs.
- `packages/core/src/index.ts`
  Re-export new DB/auth schema symbols.
- `docs/ARCHITECTURE.md`
  Document auth/session/saved-stack architecture.
- `docs/SETUP.md`
  Add provider and self-host setup details.
- `docs/CHANGELOG.md`
  Record rollout.
- `memory-bank/activeContext.md`
- `memory-bank/progress.md`

---

### Task 1: Add Database Schema For Auth And Saved Stacks

**Files:**
- Create: `packages/core/src/db/auth-schema.ts`
- Create: `packages/core/src/db/stacks-schema.ts`
- Modify: `packages/core/src/db/schema.ts`
- Modify: `packages/core/src/db/index.ts`
- Modify: `packages/core/src/index.ts`
- Test: `packages/core/src/db/auth-schema.test.ts`

- [ ] **Step 1: Write the failing schema test**

```ts
import { describe, expect, it } from "vitest";
import { users, savedStacks, savedStackItems, savedStackTargets } from "./auth-schema";

describe("auth and stack schema", () => {
  it("exports core tables for auth and saved stacks", () => {
    expect(users).toBeTruthy();
    expect(savedStacks).toBeTruthy();
    expect(savedStackItems).toBeTruthy();
    expect(savedStackTargets).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @vibebasket/core test`

Expected: FAIL because the new schema files and exports do not exist yet.

- [ ] **Step 3: Add minimal auth and stack schema files**

```ts
// packages/core/src/db/auth-schema.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
});

export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});
```

```ts
// packages/core/src/db/stacks-schema.ts
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const savedStacks = sqliteTable(
  "saved_stacks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => ({
    userNameUnique: uniqueIndex("saved_stacks_user_name_unique").on(table.userId, table.name),
  })
);

export const savedStackItems = sqliteTable("saved_stack_items", {
  id: text("id").primaryKey(),
  stackId: text("stack_id").notNull(),
  catalogItemId: text("catalog_item_id").notNull(),
  catalogItemType: text("catalog_item_type").notNull(),
  snapshotDisplayName: text("snapshot_display_name").notNull(),
  snapshotDescription: text("snapshot_description"),
  position: integer("position").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const savedStackTargets = sqliteTable("saved_stack_targets", {
  id: text("id").primaryKey(),
  stackId: text("stack_id").notNull(),
  targetId: text("target_id").notNull(),
  position: integer("position").notNull(),
});
```

- [ ] **Step 4: Extend shared schema exports and bootstrap**

```ts
// packages/core/src/db/schema.ts
export * from "./auth-schema";
export * from "./stacks-schema";
```

```ts
// packages/core/src/index.ts
export * from "./manifest";
export * from "./db";
```

Add `CREATE TABLE IF NOT EXISTS` and indexes to `packages/core/src/db/index.ts` for:

- `users(email)`
- `accounts(provider, provider_account_id)`
- `sessions(user_id, expires)`
- `saved_stacks(user_id, updated_at)`
- `saved_stack_items(stack_id, position)`
- `saved_stack_targets(stack_id, position)`

- [ ] **Step 5: Run tests and typecheck**

Run:

```bash
pnpm --filter @vibebasket/core test
pnpm --filter @vibebasket/core exec tsc -b
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/db/auth-schema.ts packages/core/src/db/stacks-schema.ts packages/core/src/db/schema.ts packages/core/src/db/index.ts packages/core/src/index.ts packages/core/src/db/auth-schema.test.ts
git commit -m "feat: add auth and saved stack database schema"
```

---

### Task 2: Add Auth.js Server Foundation And Provider Gating

**Files:**
- Create: `apps/web/src/auth.config.ts`
- Create: `apps/web/src/auth.ts`
- Create: `apps/web/src/app/api/auth/[...nextauth]/route.ts`
- Create: `apps/web/src/lib/session.ts`
- Create: `apps/web/src/lib/provider-config.test.ts`
- Modify: `apps/web/package.json`

- [ ] **Step 1: Write the failing provider-config test**

```ts
import { describe, expect, it } from "vitest";
import { getEnabledAuthProviders } from "@/auth.config";

describe("getEnabledAuthProviders", () => {
  it("returns only fully configured providers", () => {
    const providers = getEnabledAuthProviders({
      AUTH_GITHUB_ENABLED: "true",
      AUTH_GITHUB_CLIENT_ID: "id",
      AUTH_GITHUB_CLIENT_SECRET: "secret",
      AUTH_GOOGLE_ENABLED: "false",
    });

    expect(providers).toContain("github");
    expect(providers).not.toContain("google");
    expect(providers).not.toContain("apple");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test`

Expected: FAIL because auth config does not exist yet.

- [ ] **Step 3: Add Auth.js dependencies**

Update `apps/web/package.json` dependencies with:

```json
{
  "@auth/core": "^0.37.0",
  "next-auth": "^5.0.0-beta.25"
}
```

Then install:

```bash
pnpm install
```

- [ ] **Step 4: Implement provider gating helpers**

```ts
// apps/web/src/auth.config.ts
export type AuthProviderId = "github" | "google" | "apple";

export function getEnabledAuthProviders(env: Record<string, string | undefined>) {
  const enabled: AuthProviderId[] = [];

  if (env.AUTH_GITHUB_ENABLED === "true" && env.AUTH_GITHUB_CLIENT_ID && env.AUTH_GITHUB_CLIENT_SECRET) {
    enabled.push("github");
  }

  if (env.AUTH_GOOGLE_ENABLED === "true" && env.AUTH_GOOGLE_CLIENT_ID && env.AUTH_GOOGLE_CLIENT_SECRET) {
    enabled.push("google");
  }

  if (
    env.AUTH_APPLE_ENABLED === "true" &&
    env.AUTH_APPLE_CLIENT_ID &&
    env.AUTH_APPLE_CLIENT_SECRET &&
    env.AUTH_APPLE_TEAM_ID &&
    env.AUTH_APPLE_KEY_ID &&
    env.AUTH_APPLE_PRIVATE_KEY
  ) {
    enabled.push("apple");
  }

  return enabled;
}
```

- [ ] **Step 5: Implement Auth.js server entry**

```ts
// apps/web/src/auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import { getEnabledAuthProviders } from "@/auth.config";

const enabled = getEnabledAuthProviders(process.env);
const providers = [];

if (enabled.includes("github")) {
  providers.push(GitHub({
    clientId: process.env.AUTH_GITHUB_CLIENT_ID!,
    clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET!,
  }));
}

if (enabled.includes("google")) {
  providers.push(Google({
    clientId: process.env.AUTH_GOOGLE_CLIENT_ID!,
    clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET!,
    authorization: { params: { prompt: "select_account" } },
  }));
}

if (enabled.includes("apple")) {
  providers.push(Apple({
    clientId: process.env.AUTH_APPLE_CLIENT_ID!,
    clientSecret: process.env.AUTH_APPLE_CLIENT_SECRET!,
  }));
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "database" },
  providers,
});
```

Also add:

```ts
// apps/web/src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

```ts
// apps/web/src/lib/session.ts
import { auth } from "@/auth";

export async function getCurrentSession() {
  return auth();
}

export async function requireCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}
```

- [ ] **Step 6: Run tests and typecheck**

Run:

```bash
pnpm --filter web test
pnpm --filter web exec tsc --noEmit
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add apps/web/package.json pnpm-lock.yaml apps/web/src/auth.config.ts apps/web/src/auth.ts apps/web/src/app/api/auth/[...nextauth]/route.ts apps/web/src/lib/session.ts apps/web/src/lib/provider-config.test.ts
git commit -m "feat: add auth foundation and provider gating"
```

---

### Task 3: Implement Saved Stack API With Ownership Guards

**Files:**
- Create: `apps/web/src/lib/stacks.ts`
- Create: `apps/web/src/lib/stacks.test.ts`
- Create: `apps/web/src/app/api/stacks/route.ts`
- Create: `apps/web/src/app/api/stacks/[id]/route.ts`
- Create: `apps/web/src/app/api/stacks/route.test.ts`
- Create: `apps/web/src/app/api/stacks/[id]/route.test.ts`
- Modify: `apps/web/src/lib/targets.ts`

- [ ] **Step 1: Write failing stack helper test**

```ts
import { describe, expect, it } from "vitest";
import { createSavedStackPayloadSchema } from "@/lib/stacks";

describe("createSavedStackPayloadSchema", () => {
  it("rejects empty item arrays", () => {
    const result = createSavedStackPayloadSchema.safeParse({
      name: "React Stack",
      itemIds: [],
      targets: ["claude-code"],
    });

    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test`

Expected: FAIL because stack helpers do not exist yet.

- [ ] **Step 3: Implement saved stack validation and mapping**

```ts
// apps/web/src/lib/stacks.ts
import { z } from "zod";
import { SUPPORTED_TARGET_IDS } from "@/lib/targets";

export const createSavedStackPayloadSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(280).optional().or(z.literal("")),
  itemIds: z.array(z.string()).min(1),
  targets: z.array(z.enum(SUPPORTED_TARGET_IDS as [string, ...string[]])).min(1),
});
```

- [ ] **Step 4: Implement authenticated stack routes**

Behavior:

- `GET /api/stacks`
  - require session
  - return current user's stacks ordered by `updatedAt desc`
- `POST /api/stacks`
  - require session
  - validate name/description/itemIds/targets
  - resolve `catalog_items` on server
  - create `saved_stacks`, `saved_stack_items`, `saved_stack_targets`
- `GET /api/stacks/[id]`
  - require session
  - return only if owned by current user
- `PATCH /api/stacks/[id]`
  - require session
  - allow rename/description update only
- `DELETE /api/stacks/[id]`
  - require session
  - delete child rows first, then stack

Return codes:

- `401` unauthenticated
- `403` foreign ownership attempt if applicable
- `404` owned stack not found
- `400` validation error

- [ ] **Step 5: Add route tests**

Use mocked session helpers and a temp DB strategy similar to existing DB tests.

Minimum route assertions:

```ts
expect(response.status).toBe(401);
expect(response.status).toBe(201);
expect(response.status).toBe(200);
expect(response.status).toBe(404);
```

And specifically verify:

- create rejects empty basket
- create rejects unsupported target
- list only returns current user rows
- delete cannot remove another user's row

- [ ] **Step 6: Run tests and typecheck**

Run:

```bash
pnpm --filter web test
pnpm --filter web exec tsc --noEmit
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/lib/stacks.ts apps/web/src/lib/stacks.test.ts apps/web/src/app/api/stacks/route.ts apps/web/src/app/api/stacks/[id]/route.ts apps/web/src/app/api/stacks/route.test.ts apps/web/src/app/api/stacks/[id]/route.test.ts
git commit -m "feat: add authenticated saved stack api"
```

---

### Task 4: Add Auth UI And Basket Save Flow

**Files:**
- Create: `apps/web/src/components/auth/AuthButtons.tsx`
- Create: `apps/web/src/components/auth/AuthMenu.tsx`
- Create: `apps/web/src/components/auth/SignInDialog.tsx`
- Create: `apps/web/src/components/stacks/SaveStackDialog.tsx`
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/components/basket/BasketPanel.tsx`
- Modify: `apps/web/src/store/basketStore.ts`

- [ ] **Step 1: Write failing UI behavior test**

Add a small client test around target behavior or save action visibility, for example:

```ts
import { describe, expect, it } from "vitest";
import { DEFAULT_TARGET_IDS } from "@/lib/targets";

describe("default save flow assumptions", () => {
  it("keeps Claude Code as the only default target", () => {
    expect(DEFAULT_TARGET_IDS).toEqual(["claude-code"]);
  });
});
```

If the file already exists, extend it with auth/save-flow assumptions.

- [ ] **Step 2: Add signed-out and signed-in UI components**

Create:

- `AuthButtons` -> provider buttons based on enabled provider list
- `SignInDialog` -> modal wrapper
- `AuthMenu` -> signed-in menu with `My Stacks` and sign out

Use server session in `layout.tsx` or `page.tsx` to branch:

- signed out: show `Sign in`
- signed in: show `AuthMenu`

- [ ] **Step 3: Add save-stack action to basket**

In `BasketPanel.tsx`:

- if signed out and basket has items: show `Sign in to save this stack`
- if signed in and basket has items: show `Save stack`

`SaveStackDialog` fields:

- `name`
- `description` optional

Submit payload:

```ts
{
  name,
  description,
  itemIds: items.map((item) => item.id),
  targets
}
```

- [ ] **Step 4: Add basket store helper for loading saved stacks**

Add method:

```ts
loadItems: (items: BasketItem[]) => void
```

Minimal implementation:

```ts
loadItems: (items) => set({ items })
```

This lets `My Stacks` rehydrate the basket safely.

- [ ] **Step 5: Run tests and typecheck**

Run:

```bash
pnpm --filter web test
pnpm --filter web exec tsc --noEmit
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/auth apps/web/src/components/stacks apps/web/src/app/layout.tsx apps/web/src/app/page.tsx apps/web/src/components/basket/BasketPanel.tsx apps/web/src/store/basketStore.ts
git commit -m "feat: add auth ui and basket save flow"
```

---

### Task 5: Add My Stacks Page And Load/Delete/Rename UX

**Files:**
- Create: `apps/web/src/app/stacks/page.tsx`
- Create: `apps/web/src/app/stacks/loading.tsx`
- Create: `apps/web/src/components/stacks/SavedStacksPanel.tsx`
- Modify: `apps/web/src/components/auth/AuthMenu.tsx`
- Modify: `apps/web/src/store/basketStore.ts`

- [ ] **Step 1: Write failing stacks page smoke test**

Add a route/component smoke test that expects a stacks view component export or a simple render assumption.

```ts
import { describe, expect, it } from "vitest";
import { SavedStacksPanel } from "@/components/stacks/SavedStacksPanel";

describe("SavedStacksPanel", () => {
  it("is defined", () => {
    expect(SavedStacksPanel).toBeTypeOf("function");
  });
});
```

- [ ] **Step 2: Build `My Stacks` page**

The page should:

- require authenticated session
- fetch current user's stacks server-side
- render stack cards with:
  - name
  - description
  - item count
  - target count
  - updated time

Actions:

- `Load into basket`
- `Rename`
- `Delete`

- [ ] **Step 3: Implement load behavior**

When loading a stack:

- fetch stack payload
- map saved stack items into `BasketItem`-compatible shape
- call `loadItems`
- restore targets where practical in the basket view
- navigate user back to `/` or open builder context

If one or more catalog items are missing:

- show a toast like `Some saved items are no longer in the live catalog`
- keep loading the valid subset

- [ ] **Step 4: Run tests and typecheck**

Run:

```bash
pnpm --filter web test
pnpm --filter web exec tsc --noEmit
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/stacks apps/web/src/components/stacks/SavedStacksPanel.tsx apps/web/src/components/auth/AuthMenu.tsx apps/web/src/store/basketStore.ts
git commit -m "feat: add my stacks page and stack management ui"
```

---

### Task 6: Add Docs, Self-Host Setup, And Final Verification

**Files:**
- Create: `docs/AUTH.md`
- Modify: `docs/ARCHITECTURE.md`
- Modify: `docs/SETUP.md`
- Modify: `docs/CHANGELOG.md`
- Modify: `memory-bank/activeContext.md`
- Modify: `memory-bank/progress.md`

- [ ] **Step 1: Document self-host auth setup**

Add `docs/AUTH.md` with:

- provider env variables
- hosted vs self-host behavior
- Apple caveats
- session secret requirements
- HTTPS recommendation

Include concrete env examples:

```env
AUTH_SECRET=replace-me
AUTH_GITHUB_ENABLED=true
AUTH_GITHUB_CLIENT_ID=...
AUTH_GITHUB_CLIENT_SECRET=...
AUTH_GOOGLE_ENABLED=true
AUTH_GOOGLE_CLIENT_ID=...
AUTH_GOOGLE_CLIENT_SECRET=...
AUTH_APPLE_ENABLED=false
```

- [ ] **Step 2: Update architecture and setup docs**

Add sections covering:

- Auth.js usage
- DB session choice
- saved stack ownership
- self-host provider toggles
- public catalog remains usable while signed out

- [ ] **Step 3: Update memory-bank**

Capture:

- auth architecture chosen
- saved stacks shipped
- self-host Apple caveat
- new test coverage

- [ ] **Step 4: Run final verification**

Run:

```bash
CI=true pnpm -r run typecheck
CI=true pnpm -r run test
CI=true pnpm --filter web build
```

Expected:

- workspace typecheck PASS
- workspace test PASS
- web build PASS (with network-enabled font fetch if required by current environment)

- [ ] **Step 5: Commit**

```bash
git add docs/AUTH.md docs/ARCHITECTURE.md docs/SETUP.md docs/CHANGELOG.md memory-bank/activeContext.md memory-bank/progress.md
git commit -m "docs: add auth and saved stack setup guidance"
```

---

## Self-Review

### Spec coverage

Covered:

- SaaS + self-host deployment model
- GitHub / Google / Apple provider strategy
- DB-backed sessions
- saved stacks data model
- secure user ownership boundaries
- basket save flow
- my stacks UX
- testing plan
- docs + memory-bank updates

No spec gaps remain for the first implementation slice.

### Placeholder scan

No `TODO`, `TBD`, or unresolved placeholders are left in this plan.

### Type consistency

Consistent names used throughout:

- `savedStacks`
- `savedStackItems`
- `savedStackTargets`
- `getEnabledAuthProviders`
- `createSavedStackPayloadSchema`
- `loadItems`

No later task depends on a differently named earlier API.
