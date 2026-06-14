import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { McpEntry, RuleEntry, SkillEntry } from "@vibebasket/core";
import { describe, expect, it } from "vitest";
import type { McpConfigResult } from "./mcp-utils";
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
      requiredSecrets: [],
      verified: false,
    };

    const result = adapter.applyMcps(config, [newMcp], {}, { force: false }) as McpConfigResult;
    expect(result.mcpServers.existing).toBeDefined();
    expect(result.mcpServers["new-mcp"]).toBeDefined();
    expect(result.mcpServers["new-mcp"].command).toBe("npx");
  });

  it("should append rules and skills correctly inside .clinerules", async () => {
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

      const rulesFile = path.join(projectRoot, ".clinerules");
      const rulesContent = await fs.readFile(rulesFile, "utf8");

      expect(rulesContent).toContain("Skill: Inline Skill (inline-skill)");
      expect(rulesContent).toContain("Skill system instruction");
      expect(rulesContent).toContain("Rule: Coding Style (test-rule)");
      expect(rulesContent).toContain("Use tabs for indentation");

      // Idempotency: Running again should not duplicate
      await adapter.applySkills(skills, "project", projectRoot);
      const afterSecondRun = await fs.readFile(rulesFile, "utf8");

      const skillCount = (afterSecondRun.match(/inline-skill/g) || []).length;
      // Should find two matches: one in START tag, one in END tag, and one in header (total 3 matches per block, no duplicate blocks)
      expect(skillCount).toBe(3);

      // Verify Delimiter Block Updates (Modifying skill content)
      const updatedSkills: SkillEntry[] = [
        {
          id: "inline-skill",
          displayName: "Inline Skill",
          source: {
            type: "inline",
            content: "Updated skill instruction content",
          },
          verified: true,
        },
      ];
      await adapter.applySkills(updatedSkills, "project", projectRoot);
      const afterUpdate = await fs.readFile(rulesFile, "utf8");
      expect(afterUpdate).toContain("Updated skill instruction content");
      expect(afterUpdate).not.toContain("Skill system instruction");
    } finally {
      await fs.rm(projectRoot, { recursive: true, force: true });
    }
  });
});
