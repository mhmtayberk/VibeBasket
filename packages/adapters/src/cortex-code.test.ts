import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CortexCodeAdapter } from "./cortex-code";

describe("CortexCodeAdapter", () => {
  let tmpDir: string;
  const adapter = new CortexCodeAdapter();

  beforeEach(() => {
    tmpDir = path.join(os.tmpdir(), `vibebasket-test-cortex-${Date.now()}`);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("resolves user config path", () => {
    expect(adapter.configPath("user")).toContain(".snowflake/cortex/mcp.json");
  });

  it("resolves project config path", () => {
    expect(adapter.configPath("project", tmpDir)).toBe(
      path.join(tmpDir, ".snowflake", "cortex", "mcp.json"),
    );
  });

  it("reads default config when file does not exist", async () => {
    const config = await adapter.readConfig("user");
    expect(config).toEqual({ mcpServers: {} });
  });

  it("applies MCP servers to config", () => {
    const config = { mcpServers: {} };
    const mcps = [
      {
        id: "test-mcp",
        displayName: "Test",
        runtime: "npx" as const,
        command: "test-cmd",
        args: [],
        env: {},
        requiredSecrets: [],
        verified: false,
      },
    ];
    const result = adapter.applyMcps(config, mcps, {}, { force: false });
    expect(result).toHaveProperty("mcpServers.test-mcp");
  });

  it("has correct capabilities", () => {
    expect(adapter.supportsMcp).toBe(true);
    expect(adapter.supportsSkills).toBe(true);
    expect(adapter.supportsRules).toBe(false);
    expect(adapter.displayName).toBe("Cortex Code");
  });
});
