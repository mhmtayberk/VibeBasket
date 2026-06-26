import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { McpEntry, SkillEntry } from "../../core/src/manifest.js";
import { ContinueAdapter } from "./continue.js";

describe("ContinueAdapter", () => {
  it("should merge new MCPs into YAML-style mcpServers arrays idempotently", () => {
    const adapter = new ContinueAdapter();
    const config = {
      mcpServers: [
        {
          name: "existing",
          command: "node",
          args: ["index.js"],
        },
      ],
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
      mcpServers: Array<{ name: string; command?: string }>;
    };

    expect(result.mcpServers).toHaveLength(2);
    expect(result.mcpServers.find((server) => server.name === "existing")).toBeDefined();
    expect(result.mcpServers.find((server) => server.name === "new-mcp")?.command).toBe("npx");
  });

  it("should write prompt files and register them in config.yaml", async () => {
    const adapter = new ContinueAdapter();
    const projectRoot = path.join(os.tmpdir(), `continue-test-${Date.now()}`);
    await fs.mkdir(projectRoot, { recursive: true });

    try {
      const skills: SkillEntry[] = [
        {
          id: "inline-skill",
          displayName: "Inline Skill",
          source: {
            type: "inline",
            content: "System instruction content",
          },
          verified: true,
        },
        {
          id: "github-skill",
          displayName: "GitHub Skill",
          source: {
            type: "github",
            repo: "user/repo",
            path: "skills/test",
            ref: "v1.0.0",
          },
          verified: false,
        },
      ];

      await adapter.applySkills(skills, "project", projectRoot);

      const inlineFile = path.join(projectRoot, ".continue", "prompts", "inline-skill.prompt");
      const githubFile = path.join(projectRoot, ".continue", "prompts", "github-skill.prompt");
      const configFile = path.join(projectRoot, ".continue", "config.yaml");

      const inlineContent = await fs.readFile(inlineFile, "utf8");
      expect(inlineContent).toContain("name: Inline Skill");
      expect(inlineContent).toContain("invokable: true");
      expect(inlineContent).toContain("System instruction content");

      const githubContent = await fs.readFile(githubFile, "utf8");
      expect(githubContent).toContain("name: GitHub Skill");
      expect(githubContent).toContain("user/repo/skills/test");

      const configContent = await fs.readFile(configFile, "utf8");
      expect(configContent).toContain("prompts:");
      expect(configContent).toContain(`file://${inlineFile}`);
      expect(configContent).toContain(`file://${githubFile}`);
    } finally {
      await fs.rm(projectRoot, { recursive: true, force: true });
    }
  });
});
