import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { VoidAdapter } from "./void.js";
import type { McpEntry, SkillEntry, RuleEntry } from "@vibebasket/core";

describe("VoidAdapter", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vibebasket-void-test-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("should resolve project config path correctly", () => {
    const adapter = new VoidAdapter();
    expect(adapter.configPath("project", tempDir)).toContain(".void/mcp.json");
    expect(adapter.configPath("user")).toContain("mcp_servers.json");
  });

  it("should merge MCP configurations correctly", () => {
    const adapter = new VoidAdapter();
    const config = {
      mcpServers: {
        existing: { command: "node" }
      }
    };
    const mcp: McpEntry = {
      id: "test-mcp",
      displayName: "Test",
      runtime: "npx",
      command: "npx",
      args: ["test"],
      env: {},
      requiredSecrets: [],
      verified: true
    };

    const result = adapter.applyMcps(config, [mcp], {}, { force: false }) as any;
    expect(result.mcpServers.existing).toBeDefined();
    expect(result.mcpServers["test-mcp"]).toBeDefined();
    expect(result.mcpServers["test-mcp"].command).toBe("npx");
  });

  it("should write skills/rules inside both .voidrules and .clinerules", async () => {
    const adapter = new VoidAdapter();
    const skills: SkillEntry[] = [
      {
        id: "void-skill",
        displayName: "Void Skill",
        source: { type: "inline", content: "Void custom flow instructions." },
        verified: true
      }
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
        verified: true
      }
    ];

    await adapter.applyRules(rules, "project", tempDir);
    rules[0]!.content = "Updated second run rules.";
    await adapter.applyRules(rules, "project", tempDir);

    const voidRulesContent = await fs.readFile(path.join(tempDir, ".voidrules"), "utf8");
    const occurrences = (voidRulesContent.match(/VIBEBASKET START/g) || []).length;

    expect(occurrences).toBe(1);
    expect(voidRulesContent).toContain("Updated second run rules.");
    expect(voidRulesContent).not.toContain("First run rules.");
  });
});
