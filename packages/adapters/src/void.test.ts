import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { McpEntry, RuleEntry, SkillEntry } from "../../core/src/manifest.js";
import type { McpConfigResult } from "./mcp-utils";
import { VoidAdapter } from "./void.js";

describe("VoidAdapter", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vibebasket-void-test-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("should resolve the official user config path and reject project scope MCP config", () => {
    const adapter = new VoidAdapter();
    expect(() => adapter.configPath("project", tempDir)).toThrow(
      "Void Editor MCP configuration is only supported at user scope.",
    );
    expect(adapter.configPath("user")).toContain(".void-editor/mcp.json");
  });

  it("should merge MCP configurations correctly", () => {
    const adapter = new VoidAdapter();
    const config = {
      mcpServers: {
        existing: { command: "node" },
      },
    };
    const mcp: McpEntry = {
      id: "test-mcp",
      displayName: "Test",
      runtime: "npx",
      command: "npx",
      args: ["test"],
      env: {},
      headers: {},
      requiredSecrets: [],
      verified: true,
    };

    const result = adapter.applyMcps(config, [mcp], {}, { force: false }) as McpConfigResult;
    expect(result.mcpServers.existing).toBeDefined();
    const testMcp = result.mcpServers["test-mcp"];
    expect(testMcp).toBeDefined();
    if (!testMcp) {
      throw new Error("Expected test-mcp to be present");
    }
    expect(testMcp.command).toBe("npx");
  });

  it("should write skills/rules inside both .voidrules and .clinerules", async () => {
    const adapter = new VoidAdapter();
    const skills: SkillEntry[] = [
      {
        id: "void-skill",
        displayName: "Void Skill",
        source: { type: "inline", content: "Void custom flow instructions." },
        verified: true,
      },
    ];

    await adapter.applySkills(skills, "project", tempDir);

    const voidRulesContent = await fs.readFile(path.join(tempDir, ".voidrules"), "utf8");
    const clineRulesContent = await fs.readFile(path.join(tempDir, ".clinerules"), "utf8");

    expect(voidRulesContent).toContain("# >>> VIBEBASKET START: void-skill <<<");
    expect(voidRulesContent).toContain("Void custom flow instructions.");
    expect(clineRulesContent).toContain("# >>> VIBEBASKET START: void-skill <<<");
    expect(clineRulesContent).toContain("Void custom flow instructions.");
  });

  it("should be idempotent when applying rules multiple times", async () => {
    const adapter = new VoidAdapter();
    const rules: RuleEntry[] = [
      {
        id: "void-rule",
        displayName: "Void Rule",
        content: "First run rules.",
        verified: true,
      },
    ];

    await adapter.applyRules(rules, "project", tempDir);
    const [firstRule] = rules;
    expect(firstRule).toBeDefined();
    if (!firstRule) {
      throw new Error("Expected seeded Void rule");
    }
    firstRule.content = "Updated second run rules.";
    await adapter.applyRules(rules, "project", tempDir);

    const voidRulesContent = await fs.readFile(path.join(tempDir, ".voidrules"), "utf8");
    const occurrences = (voidRulesContent.match(/VIBEBASKET START/g) || []).length;

    expect(occurrences).toBe(1);
    expect(voidRulesContent).toContain("Updated second run rules.");
    expect(voidRulesContent).not.toContain("First run rules.");
  });
});
