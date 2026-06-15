# Hardening Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the first community-readiness hardening increment by finalizing catalog/apply correctness fixes, adding missing regression coverage, introducing a shared target capability contract, and adding baseline web security protections.

**Architecture:** Build on the current in-flight correctness work instead of rewriting major subsystems. First stabilize the catalog and adapter/apply contracts, then centralize target capability metadata so UI/API/CLI/adapters share one truth surface, and finally add lightweight web security protections plus verification/documentation updates.

**Tech Stack:** TypeScript, Next.js App Router, Vitest, Playwright, Drizzle/LibSQL, Auth.js, pnpm workspace

---

## File Structure

### Existing files to modify

- `packages/registry/src/index.ts`
  - Collector parsing, skill provenance classification, canonical identity, persistence helpers
- `packages/registry/src/index.test.ts`
  - Registry collector and dedupe regression tests
- `packages/core/src/manifest.ts`
  - Bundle/catalog manifest schema truth
- `packages/adapters/src/*.ts`
  - Target capability metadata and MCP config writers
- `packages/adapters/src/antigravity.test.ts`
  - Existing adapter regression coverage
- `apps/cli/src/apply.ts`
  - Apply preflight, partial-failure handling, capability checks
- `apps/web/src/app/api/catalog/route.ts`
  - Search ranking and query behavior
- `apps/web/src/lib/targets.ts`
  - Shared web target metadata surface
- `apps/web/src/components/basket/BasketPanel.tsx`
  - Bundle/apply readiness messaging if capability metadata changes
- `apps/web/src/app/layout.tsx`
  - Security header / metadata integration if needed
- `apps/web/next.config.ts` or `apps/web/next.config.mjs`
  - Security headers / rate-limit-friendly config surface
- `docs/PROJECT_OVERVIEW.md`
  - Product truth
- `docs/CHANGELOG.md`
  - Delivery history
- `memory-bank/activeContext.md`
  - Live state
- `memory-bank/progress.md`
  - Recent progress

### New files to create

- `packages/adapters/src/mcp-utils.test.ts`
  - Remote MCP serialization regression coverage
- `apps/cli/src/apply.test.ts`
  - Apply failure-mode regressions
- `packages/adapters/src/target-capabilities.ts`
  - Shared adapter capability registry for apply-truth decisions
- `apps/web/src/lib/rate-limit.ts`
  - Lightweight route limiter helper
- `apps/web/src/lib/security-headers.ts`
  - Centralized response header constants/helper
- `apps/web/src/app/api/catalog/route.test.ts`
  - Search ordering and parameter behavior
- `apps/web/src/app/api/catalog/status/route.test.ts`
  - Status route and abuse-path smoke

### Optional split if file size grows

- `packages/registry/src/skill-classification.ts`
  - Only split if `index.ts` becomes harder to reason about after the tests land

---

### Task 1: Finalize The In-Flight Catalog And Apply Correctness Patch

**Files:**
- Modify: `packages/registry/src/index.ts`
- Modify: `packages/core/src/manifest.ts`
- Modify: `packages/adapters/src/cursor.ts`
- Modify: `packages/adapters/src/vscode.ts`
- Modify: `packages/adapters/src/windsurf.ts`
- Modify: `packages/adapters/src/antigravity.ts`
- Modify: `apps/cli/src/apply.ts`

- [ ] **Step 1: Write the failing regression tests for the current patch surface**

```ts
// packages/adapters/src/mcp-utils.test.ts
import { describe, expect, it } from "vitest";
import { mergeStandardMcpServers } from "./mcp-utils";

describe("mergeStandardMcpServers", () => {
	it("serializes remote MCP entries as http servers", () => {
		const result = mergeStandardMcpServers(
			{},
			[
				{
					id: "remote-docs",
					name: "Remote Docs",
					transport: { type: "http", url: "https://example.com/mcp" },
				},
			],
		);

		expect(result["remote-docs"]).toEqual({
			type: "http",
			url: "https://example.com/mcp",
		});
	});
});
```

```ts
// apps/cli/src/apply.test.ts
it("fails when a target does not support the requested scope", async () => {
	await expect(
		applyBundle(bundleWithUnsupportedRuleScope, {
			targets: ["cursor"],
			scope: "project",
		}),
	).rejects.toThrow("does not support");
});
```

- [ ] **Step 2: Run the focused tests to verify they fail first**

Run:

```bash
pnpm --filter @vibebasket/adapters test
pnpm --filter cli test
```

Expected:

- adapter test fails because remote MCP output is not asserted yet
- CLI test fails because unsupported scope / partial failure handling is incomplete

- [ ] **Step 3: Implement the minimal correctness fixes**

```ts
// packages/core/src/manifest.ts
const GitHubSkillSourceSchema = z.object({
	type: z.literal("github"),
	repo: z.string().min(1),
	path: z.string().min(1),
	ref: z.string().min(1).optional(),
});
```

```ts
// packages/registry/src/index.ts
function canonicalSkillKey(entry: SkillEntry) {
	if (entry.source.type === "github") {
		return [
			entry.source.repo.toLowerCase(),
			entry.source.path.toLowerCase(),
			(entry.source.ref ?? "").toLowerCase(),
		].join("::");
	}

	return entry.id;
}

function cleanEscapedValue(value: string) {
	return value
		.replace(/^['"]|['"]$/g, "")
		.replace(/\\+/g, "\\")
		.replace(/\\+$/g, "")
		.trim();
}
```

```ts
// apps/cli/src/apply.ts
if (!adapter.supportsScope(scope)) {
	throw new Error(
		`Target ${targetId} does not support ${scope} scope for this bundle`,
	);
}

failedTargets.push({ targetId, reason: errorMessage });

if (failedTargets.length > 0) {
	throw new Error(
		`Bundle apply was incomplete: ${failedTargets.map((t) => t.targetId).join(", ")}`,
	);
}
```

- [ ] **Step 4: Re-run the focused tests and confirm they pass**

Run:

```bash
pnpm --filter @vibebasket/adapters test
pnpm --filter cli test
pnpm --filter @vibebasket/registry test
```

Expected:

- all targeted tests pass
- no new type errors from optional `ref`

- [ ] **Step 5: Commit the correctness patch checkpoint**

```bash
git add packages/core/src/manifest.ts packages/registry/src/index.ts packages/registry/src/index.test.ts packages/adapters/src/cursor.ts packages/adapters/src/vscode.ts packages/adapters/src/windsurf.ts packages/adapters/src/antigravity.ts packages/adapters/src/antigravity.test.ts packages/adapters/src/mcp-utils.test.ts apps/cli/src/apply.ts apps/cli/src/apply.test.ts
git commit -m "fix: harden catalog identity and adapter apply correctness"
```

---

### Task 2: Add Catalog Route Regression Coverage

**Files:**
- Create: `apps/web/src/app/api/catalog/route.test.ts`
- Modify: `apps/web/src/app/api/catalog/route.ts`
- Test: `apps/web/src/app/api/catalog/route.test.ts`

- [ ] **Step 1: Write failing tests for search ordering and param clamping**

```ts
it("ranks exact display name matches above description-only matches", async () => {
	const response = await GET(
		createCatalogRequest("/api/catalog?type=skill&q=postgresql&page=1&limit=10"),
	);
	const payload = await response.json();

	expect(payload.items[0].displayName).toContain("Postgresql");
	expect(payload.items[0].displayName).not.toBe("Generic SQL Helper");
});

it("clamps limit to the configured maximum", async () => {
	const response = await GET(
		createCatalogRequest("/api/catalog?type=skill&limit=9999"),
	);
	const payload = await response.json();

	expect(payload.pageSize).toBeLessThanOrEqual(100);
});
```

- [ ] **Step 2: Run the route test file and verify the new assertions fail if ranking regresses**

Run:

```bash
pnpm --filter web test -- src/app/api/catalog/route.test.ts
```

Expected:

- new test file is discovered
- at least one assertion fails until fixture/setup behavior is completed

- [ ] **Step 3: Implement or refactor only what the tests require**

```ts
const searchPriority = search
	? sql<number>`
		case
			when lower(${catalogItems.displayName}) = ${normalizedSearch} then 500
			when lower(${catalogItems.displayName}) like ${searchPrefix} then 400
			when lower(${catalogItems.displayName}) like ${searchLike} then 300
			when lower(coalesce(${catalogItems.description}, '')) like ${searchLike} then 200
			when lower(coalesce(${catalogItems.sourceUrl}, '')) like ${searchLike} then 100
			when lower(coalesce(${catalogItems.data}, '')) like ${searchLike} then 50
			else 0
		end
	`
	: null;
```

- [ ] **Step 4: Re-run the catalog route tests**

Run:

```bash
pnpm --filter web test -- src/app/api/catalog/route.test.ts
```

Expected:

- new route tests pass
- no regression in existing web suite assumptions

- [ ] **Step 5: Commit the route regression coverage**

```bash
git add apps/web/src/app/api/catalog/route.ts apps/web/src/app/api/catalog/route.test.ts
git commit -m "test: cover catalog ranking and query guardrails"
```

---

### Task 3: Consolidate Target Capability Truth

**Files:**
- Create: `packages/adapters/src/target-capabilities.ts`
- Modify: `packages/adapters/src/claude-code.ts`
- Modify: `packages/adapters/src/cline-cli.ts`
- Modify: `packages/adapters/src/codex.ts`
- Modify: `packages/adapters/src/cursor.ts`
- Modify: `packages/adapters/src/gemini-cli.ts`
- Modify: `packages/adapters/src/junie.ts`
- Modify: `packages/adapters/src/kiro.ts`
- Modify: `packages/adapters/src/vscode.ts`
- Modify: `packages/adapters/src/windsurf.ts`
- Modify: `packages/adapters/src/zed.ts`
- Modify: `apps/web/src/lib/targets.ts`
- Modify: `apps/cli/src/apply.ts`

- [ ] **Step 1: Write a failing adapter-capability contract test**

```ts
// packages/adapters/src/property.test.ts
it("exposes truthful capability metadata for every adapter", () => {
	for (const adapter of adapters) {
		expect(adapter.id).toBeTruthy();
		expect(typeof adapter.supportsRules).toBe("boolean");
		expect(typeof adapter.supportsSkills).toBe("boolean");
		expect(adapter.supportsScope("user") || adapter.supportsScope("project")).toBe(true);
	}
});
```

```ts
// apps/web/src/lib/targets.test.ts
it("web target metadata only marks auto-apply ready targets as supported", () => {
	expect(SUPPORTED_TARGET_IDS).toContain("cursor");
	expect(TARGETS.find((target) => target.id === "cursor")?.isAutoApplyReady).toBe(true);
});
```

- [ ] **Step 2: Run adapter and web tests to observe contract drift**

Run:

```bash
pnpm --filter @vibebasket/adapters test
pnpm --filter web test -- src/lib/targets.test.ts
```

Expected:

- tests fail if target metadata disagrees across layers

- [ ] **Step 3: Introduce the shared capability registry and wire consumers to it**

```ts
// packages/adapters/src/target-capabilities.ts
export const TARGET_CAPABILITIES = {
	cursor: {
		supportsSkills: false,
		supportsRules: false,
		supportedScopes: ["user", "project"] as const,
		supportsRemoteMcp: true,
	},
	claude-code: {
		supportsSkills: false,
		supportsRules: false,
		supportedScopes: ["user", "project"] as const,
		supportsRemoteMcp: true,
	},
} as const;
```

```ts
// apps/web/src/lib/targets.ts
export const TARGETS = BASE_TARGETS.map((target) => ({
	...target,
	isAutoApplyReady: SUPPORTED_TARGET_IDS.includes(target.id),
}));
```

- [ ] **Step 4: Re-run adapter and web suites**

Run:

```bash
pnpm --filter @vibebasket/adapters test
pnpm --filter web test
```

Expected:

- all capability-driven tests pass
- UI and CLI now derive from aligned truth

- [ ] **Step 5: Commit capability consolidation**

```bash
git add packages/adapters/src/target-capabilities.ts packages/adapters/src/*.ts apps/web/src/lib/targets.ts apps/cli/src/apply.ts
git commit -m "refactor: centralize target capability truth"
```

---

### Task 4: Add Baseline Web Security Guards

**Files:**
- Create: `apps/web/src/lib/rate-limit.ts`
- Create: `apps/web/src/lib/security-headers.ts`
- Modify: `apps/web/src/app/api/catalog/route.ts`
- Modify: `apps/web/src/app/api/catalog/status/route.ts`
- Modify: `apps/web/src/app/api/bundle/route.ts`
- Modify: `apps/web/src/app/api/auth/[...nextauth]/route.ts`
- Modify: `apps/web/next.config.ts`
- Create: `apps/web/src/app/api/catalog/status/route.test.ts`

- [ ] **Step 1: Write failing tests for abusive request behavior**

```ts
it("returns 429 when catalog status is hit above the allowed local rate", async () => {
	for (let index = 0; index < 6; index += 1) {
		await GET(new Request("http://localhost:3000/api/catalog/status"));
	}

	const response = await GET(new Request("http://localhost:3000/api/catalog/status"));
	expect(response.status).toBe(429);
});
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run:

```bash
pnpm --filter web test -- src/app/api/catalog/status/route.test.ts
```

Expected:

- test fails until limiter exists

- [ ] **Step 3: Implement a small in-memory limiter and shared security headers**

```ts
// apps/web/src/lib/rate-limit.ts
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
	const now = Date.now();
	const current = buckets.get(key);

	if (!current || current.resetAt <= now) {
		buckets.set(key, { count: 1, resetAt: now + windowMs });
		return { allowed: true, remaining: limit - 1 };
	}

	if (current.count >= limit) {
		return { allowed: false, remaining: 0 };
	}

	current.count += 1;
	return { allowed: true, remaining: limit - current.count };
}
```

```ts
// apps/web/src/lib/security-headers.ts
export const DEFAULT_SECURITY_HEADERS = {
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "DENY",
	"Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};
```

- [ ] **Step 4: Re-run the focused tests and the full web suite**

Run:

```bash
pnpm --filter web test -- src/app/api/catalog/status/route.test.ts
pnpm --filter web test
pnpm --filter web lint
```

Expected:

- limiter tests pass
- no route typing or formatting regressions

- [ ] **Step 5: Commit baseline security hardening**

```bash
git add apps/web/src/lib/rate-limit.ts apps/web/src/lib/security-headers.ts apps/web/src/app/api/catalog/route.ts apps/web/src/app/api/catalog/status/route.ts apps/web/src/app/api/bundle/route.ts apps/web/src/app/api/auth/[...nextauth]/route.ts apps/web/src/app/api/catalog/status/route.test.ts apps/web/next.config.ts
git commit -m "security: add baseline route protections"
```

---

### Task 5: Verify, Document, And Close The Increment

**Files:**
- Modify: `docs/PROJECT_OVERVIEW.md`
- Modify: `docs/CHANGELOG.md`
- Modify: `memory-bank/activeContext.md`
- Modify: `memory-bank/progress.md`

- [ ] **Step 1: Update the product truth docs**

```md
<!-- docs/PROJECT_OVERVIEW.md -->
- catalog search now uses weighted local ranking
- target capability truth is shared across adapters, CLI, and web metadata
- public expensive routes now have baseline rate shaping and security headers
```

- [ ] **Step 2: Run the full verification matrix**

Run:

```bash
pnpm --filter @vibebasket/registry test
pnpm --filter @vibebasket/adapters test
pnpm --filter cli test
pnpm --filter web test
pnpm --filter web lint
CI=true pnpm -r run typecheck
npx next build
npx playwright test
```

Expected:

- all checks pass
- no dirty generated files beyond intentional source/doc changes

- [ ] **Step 3: Run a quick live catalog smoke check**

Run:

```bash
pnpm catalog:sync:dry
```

Expected:

- sync completes without source errors
- counts remain plausible for the current upstream surfaces

- [ ] **Step 4: Commit docs and verification close-out**

```bash
git add docs/PROJECT_OVERVIEW.md docs/CHANGELOG.md memory-bank/activeContext.md memory-bank/progress.md
git commit -m "docs: record hardening phase 1"
```

- [ ] **Step 5: Create the integration checkpoint**

```bash
git status --short
git log --oneline -5
```

Expected:

- working tree clean
- hardening phase commits visible and reviewable

---

## Spec Coverage Check

- Catalog correctness: covered by Tasks 1 and 2
- Bundle/apply truthfulness: covered by Tasks 1 and 3
- Security hardening: covered by Task 4
- Code quality and maintainability: covered by Task 3 and Task 5
- Testing depth: covered by Tasks 1, 2, 4, and 5
- Documentation and memory fidelity: covered by Task 5

## Self-Review

- No placeholders such as `TODO`/`TBD` remain in the plan steps.
- The plan is intentionally scoped to **Phase 1** of the broader roadmap, not the entire roadmap at once.
- The task order keeps risky behavior changes ahead of docs and broad verification.
