import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { IBMBobAdapter } from "./ibm-bob";

describe("IBMBobAdapter", () => {
  let tmpDir: string;
  const adapter = new IBMBobAdapter();

  beforeEach(() => {
    tmpDir = path.join(os.tmpdir(), `vibebasket-test-bob-${Date.now()}`);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("resolves global config path", () => {
    expect(adapter.configPath("user")).toContain(".bob/mcp_settings.json");
  });

  it("resolves project config path", () => {
    expect(adapter.configPath("project", tmpDir)).toBe(path.join(tmpDir, ".bob", "mcp.json"));
  });

  it("has correct capabilities", () => {
    expect(adapter.supportsMcp).toBe(true);
    expect(adapter.supportsSkills).toBe(true);
    expect(adapter.supportsRules).toBe(false);
    expect(adapter.displayName).toBe("IBM Bob");
  });

  it("applies MCP servers and creates skills directory", async () => {
    const config = { mcpServers: {} };
    const mcps = [
      {
        id: "test",
        displayName: "T",
        runtime: "npx" as const,
        command: "c",
        args: [],
        env: {},
        requiredSecrets: [],
        verified: false,
      },
    ];
    const result = adapter.applyMcps(config, mcps, {}, { force: false });
    expect(result).toHaveProperty("mcpServers.test");

    await adapter.applySkills(
      [
        {
          id: "test-skill",
          displayName: "Test Skill",
          source: { type: "inline" as const, content: "test" },
          verified: false,
        },
      ],
      "project",
      tmpDir,
    );
    const skillPath = path.join(tmpDir, ".bob", "skills", "test-skill.md");
    expect(fs.existsSync(skillPath)).toBe(true);
  });
});
