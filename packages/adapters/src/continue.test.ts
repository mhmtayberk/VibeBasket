import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { McpEntry, SkillEntry } from "@vibebasket/core";
import { describe, expect, it } from "vitest";
import { ContinueAdapter } from "./continue.js";
import type { McpConfigResult } from "./mcp-utils";

describe("ContinueAdapter", () => {
  it("should merge new MCPs idempotently", () => {
    const adapter = new ContinueAdapter();
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

    const result = adapter.applyMcps(config, [newMcp], {}, { force: false }) as McpConfigResult;
    expect(result.mcpServers.existing).toBeDefined();
    const addedMcp = result.mcpServers["new-mcp"];
    expect(addedMcp).toBeDefined();
    if (!addedMcp) {
      throw new Error("Expected new-mcp to be present");
    }
    expect(addedMcp.command).toBe("npx");
  });

  it("should write prompts files correctly inside .continue/prompts", async () => {
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

      const inlineContent = await fs.readFile(inlineFile, "utf8");
      expect(inlineContent).toContain("name: Inline Skill");
      expect(inlineContent).toContain("System instruction content");

      const githubContent = await fs.readFile(githubFile, "utf8");
      expect(githubContent).toContain("name: GitHub Skill");
      expect(githubContent).toContain("user/repo/skills/test");
    } finally {
      await fs.rm(projectRoot, { recursive: true, force: true });
    }
  });
});
