import { describe, expect, it } from "vitest";
import {
	createStackSchema,
	normalizeStackItemIds,
	normalizeStackTargetIds,
	updateStackSchema,
} from "./stacks";

describe("stack helpers", () => {
	it("deduplicates stack items while preserving first-seen order", () => {
		expect(
			normalizeStackItemIds(["mcp-a", "skill-a", "mcp-a", "rule-a"]),
		).toEqual(["mcp-a", "skill-a", "rule-a"]);
	});

	it("rejects unsupported targets", () => {
		expect(() =>
			normalizeStackTargetIds(["claude-code", "unknown-ide"]),
		).toThrow("Unsupported target IDs: unknown-ide");
	});

	it("accepts a valid create payload", () => {
		expect(
			createStackSchema.parse({
				name: "React Stack",
				description: "Frontend defaults",
				itemIds: ["mcp-a", "skill-a"],
				targetIds: ["claude-code", "cursor"],
			}),
		).toEqual({
			name: "React Stack",
			description: "Frontend defaults",
			itemIds: ["mcp-a", "skill-a"],
			targetIds: ["claude-code", "cursor"],
		});
	});

	it("requires at least one update field", () => {
		expect(() => updateStackSchema.parse({})).toThrow(
			"Provide at least one field to update.",
		);
	});
});
