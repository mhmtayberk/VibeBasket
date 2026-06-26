import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { RuleEntry, SkillEntry } from "../../core/src/manifest.js";
import { AiderAdapter } from "./aider.js";

describe("AiderAdapter", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vibebasket-aider-test-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("should enforce project-only scope", () => {
    const adapter = new AiderAdapter();
    expect(() => adapter.configPath("user")).toThrow(/only supports 'project'/);
    expect(adapter.configPath("project", tempDir)).toContain(".aider.conf.yml");
  });

  it("should create Aider instructions and config if they do not exist", async () => {
    const adapter = new AiderAdapter();
    const skills: SkillEntry[] = [
      {
        id: "aider-skill",
        displayName: "Aider Skill",
        source: { type: "inline", content: "Aider specifications content." },
        verified: true,
      },
    ];

    await adapter.applySkills(skills, "project", tempDir);

    const instFile = path.join(tempDir, ".aiderinstructions.md");
    const configFile = path.join(tempDir, ".aider.conf.yml");

    const instContent = await fs.readFile(instFile, "utf8");
    const configContent = await fs.readFile(configFile, "utf8");

    expect(instContent).toContain("# >>> VIBEBASKET START: aider-skill <<<");
    expect(instContent).toContain("Aider specifications content.");

    expect(configContent).toContain("read:");
    expect(configContent).toContain("- .aiderinstructions.md");
  });

  it("should merge with existing single-line string read config", async () => {
    const adapter = new AiderAdapter();
    const configFile = path.join(tempDir, ".aider.conf.yml");

    // Seed existing config with a single string read flag
    await fs.writeFile(
      configFile,
      "model: gpt-4\nread: my-conventions.md\ndark-mode: true\n",
      "utf8",
    );

    const rules: RuleEntry[] = [
      {
        id: "aider-rule",
        displayName: "Aider Rule",
        content: "Rule constraints.",
        verified: true,
      },
    ];

    await adapter.applyRules(rules, "project", tempDir);

    const configContent = await fs.readFile(configFile, "utf8");
    expect(configContent).toContain("model: gpt-4");
    expect(configContent).toContain("dark-mode: true");
    expect(configContent).toContain("read:");
    expect(configContent).toContain("- my-conventions.md");
    expect(configContent).toContain("- .aiderinstructions.md");
  });

  it("should merge with existing block array read config", async () => {
    const adapter = new AiderAdapter();
    const configFile = path.join(tempDir, ".aider.conf.yml");

    // Seed existing config with an array read flag
    await fs.writeFile(configFile, "read:\n  - other-rules.md\n  - styles.md\n", "utf8");

    const rules: RuleEntry[] = [
      {
        id: "aider-rule",
        displayName: "Aider Rule",
        content: "Rule constraints.",
        verified: true,
      },
    ];

    await adapter.applyRules(rules, "project", tempDir);

    const configContent = await fs.readFile(configFile, "utf8");
    expect(configContent).toContain("read:");
    expect(configContent).toContain("- other-rules.md");
    expect(configContent).toContain("- styles.md");
    expect(configContent).toContain("- .aiderinstructions.md");
  });

  it("should be idempotent and not append if already configured", async () => {
    const adapter = new AiderAdapter();
    const configFile = path.join(tempDir, ".aider.conf.yml");

    // Seed existing config with target already present
    await fs.writeFile(configFile, "read:\n  - .aiderinstructions.md\n", "utf8");

    const rules: RuleEntry[] = [
      {
        id: "aider-rule",
        displayName: "Aider Rule",
        content: "Rule constraints.",
        verified: true,
      },
    ];

    await adapter.applyRules(rules, "project", tempDir);

    const configContent = await fs.readFile(configFile, "utf8");
    const occurrences = (configContent.match(/- .aiderinstructions.md/g) || []).length;
    expect(occurrences).toBe(1);
  });
});
