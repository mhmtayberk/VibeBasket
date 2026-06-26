import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { McpEntry, RuleEntry, SkillEntry } from "../../core/src/manifest.js";
import { RooCodeAdapter } from "./roocode.js";

describe("RooCodeAdapter", () => {
  it("should merge new MCPs idempotently", () => {
    const adapter = new RooCodeAdapter();
    const config = {
      mcpServers: {
        existing: {
          command: "node",
          args: ["index.js"],
        },
      },
    };

    const newMcp: McpEntry = {
      id: "new-mcp",
      displayName: "New MCP",
      runtime: "npx",
      command: "npx",
      args: ["-y", "test-mcp"],
      env: {},
      headers: {},
      requiredSecrets: [],
      verified: false,
    };

    const result = adapter.applyMcps(config, [newMcp], {}, { force: false }) as {
      mcpServers: Record<string, { command?: string }>;
    };
    expect(result.mcpServers.existing).toBeDefined();
    const addedMcp = result.mcpServers["new-mcp"];
    expect(addedMcp).toBeDefined();
    if (!addedMcp) {
      throw new Error("Expected new-mcp to be present");
    }
    expect(addedMcp.command).toBe("npx");
  });

  it("should write skills and rules into Roo-native directories", async () => {
    const adapter = new RooCodeAdapter();
    const projectRoot = path.join(os.tmpdir(), `roocode-test-${Date.now()}`);
    await fs.mkdir(projectRoot, { recursive: true });

    try {
      const skills: SkillEntry[] = [
        {
          id: "inline-skill",
          displayName: "Inline Skill",
          source: {
            type: "inline",
            content: "Skill system instruction",
          },
          verified: true,
        },
      ];

      const rules: RuleEntry[] = [
        {
          id: "test-rule",
          displayName: "Coding Style",
          content: "Use tabs for indentation.",
          verified: true,
        },
      ];

      await adapter.applySkills(skills, "project", projectRoot);
      await adapter.applyRules(rules, "project", projectRoot);

      const skillFile = path.join(projectRoot, ".roo", "skills", "inline-skill", "SKILL.md");
      const ruleFile = path.join(projectRoot, ".roo", "rules", "test-rule.md");

      const skillContent = await fs.readFile(skillFile, "utf8");
      const ruleContent = await fs.readFile(ruleFile, "utf8");

      expect(skillContent).toContain("name: inline-skill");
      expect(skillContent).toContain("Skill system instruction");
      expect(ruleContent).toContain("Coding Style");
      expect(ruleContent).toContain("Use tabs for indentation");
    } finally {
      await fs.rm(projectRoot, { recursive: true, force: true });
    }
  });
});
