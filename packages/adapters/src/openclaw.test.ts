import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { McpEntry, SkillEntry } from "@vibebasket/core";
import { describe, expect, it } from "vitest";
import type { McpConfigResult } from "./mcp-utils";
import { OpenClawAdapter } from "./openclaw.js";

describe("OpenClawAdapter", () => {
  it("should merge new MCPs into mcp.servers key idempotently", () => {
    const adapter = new OpenClawAdapter();
    const config = {
      "mcp.servers": {
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

    const result = adapter.applyMcps(config, [newMcp], {}, { force: false }) as McpConfigResult & {
      "mcp.servers": Record<string, unknown>;
    };
    const servers = result["mcp.servers"] as Record<string, { command?: string } | undefined>;
    expect(servers.existing).toBeDefined();
    const addedMcp = servers["new-mcp"];
    expect(addedMcp).toBeDefined();
    expect(addedMcp?.command).toBe("npx");
  });

  it("should write .openclawrules correctly", async () => {
    const adapter = new OpenClawAdapter();
    const projectRoot = path.join(os.tmpdir(), `openclaw-test-${Date.now()}`);
    await fs.mkdir(projectRoot, { recursive: true });

    try {
      const skills: SkillEntry[] = [
        {
          id: "test-skill",
          displayName: "OpenClaw Skill",
          source: {
            type: "inline",
            content: "OpenClaw custom rules content.",
          },
          verified: true,
        },
      ];

      await adapter.applySkills(skills, "project", projectRoot);

      const rulesFile = path.join(projectRoot, ".openclawrules");
      const rulesContent = await fs.readFile(rulesFile, "utf8");

      expect(rulesContent).toContain("Skill: OpenClaw Skill (test-skill)");
      expect(rulesContent).toContain("OpenClaw custom rules content.");

      // Idempotency check with updates
      const updatedSkills: SkillEntry[] = [
        {
          id: "test-skill",
          displayName: "OpenClaw Skill",
          source: {
            type: "inline",
            content: "Updated OpenClaw system content.",
          },
          verified: true,
        },
      ];
      await adapter.applySkills(updatedSkills, "project", projectRoot);
      const afterUpdate = await fs.readFile(rulesFile, "utf8");
      expect(afterUpdate).toContain("Updated OpenClaw system content.");
      expect(afterUpdate).not.toContain("OpenClaw custom rules content.");
    } finally {
      await fs.rm(projectRoot, { recursive: true, force: true });
    }
  });
});
