import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CodeBuddyAdapter } from "./codebuddy";

describe("CodeBuddyAdapter", () => {
	let tmpDir: string;
	const adapter = new CodeBuddyAdapter();

	beforeEach(() => {
		tmpDir = path.join(os.tmpdir(), `vibebasket-test-codebuddy-${Date.now()}`);
	});

	afterEach(() => {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	});

	it("resolves global config path", () => {
		expect(adapter.configPath("user")).toContain(".codebuddy/.mcp.json");
	});

	it("resolves project config path", () => {
		expect(adapter.configPath("project", tmpDir)).toBe(path.join(tmpDir, ".mcp.json"));
	});

	it("has correct capabilities", () => {
		expect(adapter.supportsMcp).toBe(true);
		expect(adapter.supportsSkills).toBe(true);
		expect(adapter.supportsRules).toBe(false);
		expect(adapter.displayName).toBe("CodeBuddy");
	});

	it("applies MCP servers and creates skills directory", async () => {
		const config = { mcpServers: {} };
		const mcps = [{ id: "test", displayName: "T", runtime: "npx" as const, command: "c", args: [], env: {}, requiredSecrets: [], verified: false }];
		const result = adapter.applyMcps(config, mcps, {}, { force: false });
		expect(result).toHaveProperty("mcpServers.test");

		await adapter.applySkills([{ id: "test-skill", displayName: "Test Skill", source: { type: "inline" as const, content: "test" }, verified: false }], "project", tmpDir);
		const skillPath = path.join(tmpDir, ".codebuddy", "skills", "test-skill.md");
		expect(fs.existsSync(skillPath)).toBe(true);
	});

	it("creates skills directory on applySkills", async () => {
		await adapter.applySkills([{ id: "hello", displayName: "Hello", source: { type: "inline" as const, content: "hi" }, verified: false }], "user");
		// Skills dir should be created in home
		const skillsDir = path.join(os.homedir(), ".codebuddy", "skills");
		expect(fs.existsSync(skillsDir)).toBe(true);
	});
});
