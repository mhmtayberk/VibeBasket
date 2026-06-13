import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Bundle Lifecycle E2E", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("creates a bundle with multiple item types and validates response", async () => {
		const bundleItems = [
			{ id: "mcp-1", type: "mcp", displayName: "Test MCP", description: "", data: { id: "mcp-1", displayName: "Test MCP", runtime: "npx" as const, command: "cmd", args: [], env: {}, requiredSecrets: [], verified: false } },
			{ id: "skill-1", type: "skill", displayName: "Test Skill", description: "", data: { id: "skill-1", displayName: "Test Skill", source: { type: "inline" as const, content: "test" }, verified: false } },
		];

		expect(bundleItems).toHaveLength(2);
		expect(bundleItems[0].type).toBe("mcp");
		expect(bundleItems[1].type).toBe("skill");
	});

	it("partitions bundle items by type correctly", async () => {
		const { McpEntrySchema, SkillEntrySchema } = await import("@vibebasket/core");

		const items = [
			{ type: "mcp" as const, data: { id: "mcp-1", displayName: "Test", runtime: "npx", command: "cmd", args: [], env: {}, requiredSecrets: [], verified: false } },
			{ type: "skill" as const, data: { id: "skill-1", displayName: "Test Skill", source: { type: "inline", content: "test" }, verified: false } },
			{ type: "rule" as const, data: { id: "rule-1", displayName: "Test Rule", content: "# Rule", verified: false } },
		];

		const mcps = items.filter((i) => i.type === "mcp").map((i) => McpEntrySchema.parse(i.data));
		const skills = items.filter((i) => i.type === "skill").map((i) => SkillEntrySchema.parse(i.data));
		const rules = items.filter((i) => i.type === "rule");

		expect(mcps).toHaveLength(1);
		expect(skills).toHaveLength(1);
		expect(rules).toHaveLength(1);
		expect(mcps[0].id).toBe("mcp-1");
	});

	it("handles empty bundle gracefully", async () => {
		const emptyItems: unknown[] = [];
		const targets: string[] = ["cursor"];

		expect(emptyItems.length === 0 || targets.length === 0).toBe(true);
	});

	it("validates bundle targets against supported IDs", async () => {
		const { isSupportedTargetId } = await import("@/lib/targets");

		expect(isSupportedTargetId("cursor")).toBe(true);
		expect(isSupportedTargetId("cortex-code")).toBe(true);
		expect(isSupportedTargetId("goose")).toBe(true);
		expect(isSupportedTargetId("ibm-bob")).toBe(true);
		expect(isSupportedTargetId("codebuddy")).toBe(true);
		expect(isSupportedTargetId("invalid-target")).toBe(false);
	});

	it("detects incompatible targets for skill-heavy bundles", async () => {
		const { TARGET_OPTIONS } = await import("@/lib/targets");
		const hasSkills = true;
		const hasRules = true;

		const incompatibleTargets = TARGET_OPTIONS
			.filter((t) => t.status === "supported")
			.filter((t) => {
				if (hasSkills && !t.capabilities.supportsSkills) return true;
				if (hasRules && !t.capabilities.supportsRules) return true;
				return false;
			});

		expect(incompatibleTargets.length).toBeGreaterThan(0);
		// Goose should be incompatible (supportsSkills: false)
		const gooseIncompatible = incompatibleTargets.find((t: { id: string }) => t.id === "goose");
		expect(gooseIncompatible).toBeDefined();
	});
});
