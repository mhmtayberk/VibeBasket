import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { McpEntry, RuleEntry, SkillEntry } from "../../core/src/manifest.js";
import { OpenCodeAdapter } from "./opencode.js";

describe("OpenCodeAdapter", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vibebasket-opencode-test-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("merges MCPs into the documented mcp config section", () => {
    const adapter = new OpenCodeAdapter();
    const config = { mcp: { existing: { type: "local", command: ["node", "server.js"] } } };

    const mcp: McpEntry = {
      id: "context7",
      displayName: "Context7",
      runtime: "npx",
      command: "npx",
      args: ["-y", "@upstash/context7-mcp"],
      env: {},
      headers: {},
      requiredSecrets: [],
      verified: true,
    };

    const result = adapter.applyMcps(config, [mcp], {}, { force: false }) as {
      mcp: Record<string, { type: string; command?: string[] }>;
    };

    expect(result.mcp.existing).toBeDefined();
    expect(result.mcp.context7?.type).toBe("local");
    expect(result.mcp.context7?.command).toEqual(["npx", "-y", "@upstash/context7-mcp"]);
  });

  it("writes skills to .opencode/skills and rules to AGENTS.md", async () => {
    const adapter = new OpenCodeAdapter();
    const skills: SkillEntry[] = [
      {
        id: "release-flow",
        displayName: "Release Flow",
        source: { type: "inline", content: "Create deterministic release notes." },
        verified: true,
      },
    ];

    const rules: RuleEntry[] = [
      {
        id: "team-style",
        displayName: "Team Style",
        content: "Keep responses concise and verify changes before finishing.",
        verified: true,
      },
    ];

    await adapter.applySkills(skills, "project", tempDir);
    await adapter.applyRules(rules, "project", tempDir);

    const skillContent = await fs.readFile(
      path.join(tempDir, ".opencode", "skills", "release-flow", "SKILL.md"),
      "utf8",
    );
    const agentsContent = await fs.readFile(path.join(tempDir, "AGENTS.md"), "utf8");

    expect(skillContent).toContain("name: release-flow");
    expect(skillContent).toContain("Create deterministic release notes.");
    expect(agentsContent).toContain("VIBEBASKET START: team-style");
    expect(agentsContent).toContain("Keep responses concise");
  });
});
