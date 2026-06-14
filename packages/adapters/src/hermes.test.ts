import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { McpEntry, SkillEntry } from "@vibebasket/core";
import { describe, expect, it } from "vitest";
import { HermesAdapter } from "./hermes.js";
import type { McpConfigResult } from "./mcp-utils";

type HermesInternals = {
  parseYaml: (input: string) => { mcp_servers: Record<string, unknown> };
  serializeYaml: (config: unknown, raw: string) => string;
};

describe("HermesAdapter", () => {
  it("should merge new MCPs into YAML config preserving comments", () => {
    const adapter = new HermesAdapter();
    const existingYaml = `# System Hermes Configuration File\n\n# Existing Servers Block\nmcp_servers:\n  existing:\n    command: "node"\n    args:\n      - "index.js"\n`;

    const newMcp: McpEntry = {
      id: "new-mcp",
      displayName: "New MCP",
      runtime: "npx",
      command: "npx",
      args: ["-y", "test-mcp"],
      env: {
        API_KEY: "secret123",
      },
      requiredSecrets: [],
      verified: false,
    };

    const adapterWithInternals = adapter as unknown as HermesInternals;
    const parsedConfig = adapterWithInternals.parseYaml(existingYaml);
    expect(parsedConfig.mcp_servers.existing).toBeDefined();
    expect(parsedConfig.mcp_servers.existing.command).toBe("node");

    const mergedConfig = adapter.applyMcps(
      parsedConfig,
      [newMcp],
      {},
      { force: false },
    ) as McpConfigResult & { mcp_servers: Record<string, Record<string, string>> };
    expect(mergedConfig.mcp_servers.existing).toBeDefined();
    expect(mergedConfig.mcp_servers["new-mcp"]).toBeDefined();
    expect(mergedConfig.mcp_servers["new-mcp"].command).toBe("npx");

    const serialized = adapterWithInternals.serializeYaml(mergedConfig, existingYaml);
    expect(serialized).toContain("# System Hermes Configuration File");
    expect(serialized).toContain("mcp_servers:");
    expect(serialized).toContain("new-mcp:");
    expect(serialized).toContain('command: "npx"');
  });

  it("should write .hermesrules correctly", async () => {
    const adapter = new HermesAdapter();
    const projectRoot = path.join(os.tmpdir(), `hermes-test-${Date.now()}`);
    await fs.mkdir(projectRoot, { recursive: true });

    try {
      const skills: SkillEntry[] = [
        {
          id: "test-skill",
          displayName: "Hermes Skill",
          source: {
            type: "inline",
            content: "Hermes system instructions content.",
          },
          verified: true,
        },
      ];

      await adapter.applySkills(skills, "project", projectRoot);

      const rulesFile = path.join(projectRoot, ".hermesrules");
      const rulesContent = await fs.readFile(rulesFile, "utf8");

      expect(rulesContent).toContain("Skill: Hermes Skill (test-skill)");
      expect(rulesContent).toContain("Hermes system instructions content.");

      // Idempotency check with updates
      const updatedSkills: SkillEntry[] = [
        {
          id: "test-skill",
          displayName: "Hermes Skill",
          source: {
            type: "inline",
            content: "Updated Hermes system content.",
          },
          verified: true,
        },
      ];
      await adapter.applySkills(updatedSkills, "project", projectRoot);
      const afterUpdate = await fs.readFile(rulesFile, "utf8");
      expect(afterUpdate).toContain("Updated Hermes system content.");
      expect(afterUpdate).not.toContain("Hermes system instructions content.");
    } finally {
      await fs.rm(projectRoot, { recursive: true, force: true });
    }
  });
});
