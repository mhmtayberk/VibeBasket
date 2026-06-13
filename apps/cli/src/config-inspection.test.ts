import { describe, expect, it } from "vitest";
import {
  extractConfiguredMcpIds,
  resolveRuleInventoryTargets,
  resolveRuleVerificationTargets,
  resolveSkillInventoryTargets,
  resolveSkillVerificationTargets,
} from "./config-inspection.js";

describe("config inspection helpers", () => {
  it("extracts MCP ids from standard and Zed-native config keys", () => {
    expect(
      extractConfiguredMcpIds({
        mcpServers: { alpha: {}, beta: {} },
      }),
    ).toEqual(["alpha", "beta"]);

    expect(
      extractConfiguredMcpIds({
        context_servers: { zedPostgres: {} },
      }),
    ).toEqual(["zedPostgres"]);
  });

  it("resolves deterministic verification targets for file-based skills and rules", () => {
    const skills = resolveSkillVerificationTargets("claude-code", "project", "/tmp/demo", [
      {
        id: "skill-a",
        displayName: "Skill A",
        source: { type: "inline", content: "x" },
        verified: false,
      },
    ]);
    const rules = resolveRuleVerificationTargets("cursor", "project", "/tmp/demo", [
      { id: "rule-a", displayName: "Rule A", content: "always", verified: false },
    ]);

    expect(skills[0]?.path).toBe("/tmp/demo/.claude/skills/skill-a/SKILL.md");
    expect(rules[0]?.path).toBe("/tmp/demo/.cursor/rules/rule-a.md");
  });

  it("resolves adapter-accurate inventory targets for skills and rules", () => {
    expect(resolveSkillInventoryTargets("continue", "project", "/tmp/demo")).toEqual([
      {
        path: "/tmp/demo/.continue/prompts",
        kind: "directory",
        fileExtension: ".prompt",
      },
    ]);

    expect(resolveRuleInventoryTargets("github-copilot", "project", "/tmp/demo")).toEqual([
      {
        path: "/tmp/demo/.github/copilot-instructions.md",
        kind: "marker-file",
      },
    ]);
  });
});
