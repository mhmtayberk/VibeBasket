import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GitHubCopilotAdapter } from "./github-copilot.js";
import type { SkillEntry, RuleEntry } from "@vibebasket/core";

describe("GitHubCopilotAdapter", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vibebasket-copilot-test-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("should enforce project-only scope", () => {
    const adapter = new GitHubCopilotAdapter();
    expect(() => adapter.configPath("user")).toThrow(/only supports 'project'/);
    expect(adapter.configPath("project", tempDir)).toContain(".github/copilot-instructions.md");
  });

  it("should apply skills inside .github/copilot-instructions.md with correct delimiters", async () => {
    const adapter = new GitHubCopilotAdapter();
    const skills: SkillEntry[] = [
      {
        id: "copilot-skill",
        displayName: "Copilot Test Skill",
        source: {
          type: "inline",
          content: "Always write clean code.",
        },
        verified: true,
      },
    ];

    await adapter.applySkills(skills, "project", tempDir);

    const file = adapter.configPath("project", tempDir);
    const content = await fs.readFile(file, "utf8");

    expect(content).toContain("# >>> VIBEBASKET START: copilot-skill <<<");
    expect(content).toContain("Always write clean code.");
    expect(content).toContain("# >>> VIBEBASKET END: copilot-skill <<<");
  });

  it("should be idempotent and update existing blocks instead of duplicating", async () => {
    const adapter = new GitHubCopilotAdapter();
    const skills: SkillEntry[] = [
      {
        id: "copilot-skill",
        displayName: "Copilot Test Skill",
        source: {
          type: "inline",
          content: "Always write clean code.",
        },
        verified: true,
      },
    ];

    // Apply first time
    await adapter.applySkills(skills, "project", tempDir);

    // Modify skill content and apply second time
    skills[0]!.source = { type: "inline", content: "Always write perfect code." };
    await adapter.applySkills(skills, "project", tempDir);

    const file = adapter.configPath("project", tempDir);
    const content = await fs.readFile(file, "utf8");

    // Check that we have exactly one block of the skill
    const occurrences = (content.match(/VIBEBASKET START/g) || []).length;
    expect(occurrences).toBe(1);
    expect(content).toContain("Always write perfect code.");
    expect(content).not.toContain("Always write clean code.");
  });

  it("should apply rules safely alongside skills", async () => {
    const adapter = new GitHubCopilotAdapter();
    const rules: RuleEntry[] = [
      {
        id: "copilot-rule",
        displayName: "Copilot Rule",
        content: "Rule context details.",
        verified: true,
      },
    ];

    await adapter.applyRules(rules, "project", tempDir);

    const file = adapter.configPath("project", tempDir);
    const content = await fs.readFile(file, "utf8");

    expect(content).toContain("# >>> VIBEBASKET START: copilot-rule <<<");
    expect(content).toContain("Rule context details.");
  });
});
