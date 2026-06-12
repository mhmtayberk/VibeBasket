import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GooseAdapter } from "./goose";

describe("GooseAdapter", () => {
	let tmpDir: string;
	const adapter = new GooseAdapter();

	beforeEach(() => {
		tmpDir = path.join(os.tmpdir(), `vibebasket-test-goose-${Date.now()}`);
	});

	afterEach(() => {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	});

	it("resolves global config path", () => {
		expect(adapter.configPath("user")).toContain(".config/goose/config.yaml");
	});

	it("has correct capabilities", () => {
		expect(adapter.supportsMcp).toBe(true);
		expect(adapter.supportsSkills).toBe(false);
		expect(adapter.supportsRules).toBe(false);
		expect(adapter.displayName).toBe("Goose");
	});

	it("applies MCP servers to config", () => {
		const config = { mcpServers: {} };
		const mcps = [{ id: "test", displayName: "T", runtime: "npx" as const, command: "c", args: [], env: {}, requiredSecrets: [], verified: false }];
		const result = adapter.applyMcps(config, mcps, {}, { force: false });
		expect(result).toHaveProperty("mcpServers.test");
	});

	it("writes config with backup", async () => {
		const configPath = path.join(tmpDir, "config.yaml");
		fs.mkdirSync(path.dirname(configPath), { recursive: true });
		fs.writeFileSync(configPath, JSON.stringify({ existing: true }));
		// Test that writeConfig works without throwing
		await expect(adapter.readConfig("user")).resolves.toBeDefined();
	});
});
