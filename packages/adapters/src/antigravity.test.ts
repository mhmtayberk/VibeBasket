import os from "node:os";
import path from "node:path";
import type { McpEntry } from "@vibebasket/core";
import { describe, expect, it } from "vitest";
import { AntigravityAdapter } from "./antigravity.js";
import type { McpConfigResult } from "./mcp-utils";

describe("AntigravityAdapter", () => {
  const adapter = new AntigravityAdapter();

  it("should have correct id and capabilities", () => {
    expect(adapter.id).toBe("antigravity");
    expect(adapter.supportsMcp).toBe(true);
    expect(adapter.supportsSkills).toBe(false);
    expect(adapter.supportsRules).toBe(false);
  });

  it("should return correct config path for user scope", () => {
    const p = adapter.configPath("user");
    expect(p).toBe(path.join(os.homedir(), ".gemini", "antigravity", "mcp_config.json"));
  });

  it("should return correct config path for project scope", () => {
    const p = adapter.configPath("project", "/test/project");
    expect(p).toBe(path.join("/test/project", ".gemini", "antigravity", "mcp_config.json"));
  });

  it("should apply MCPs cleanly to an empty config", () => {
    const mcps: McpEntry[] = [
      {
        id: "test-mcp",
        displayName: "Test MCP",
        runtime: "node",
        args: ["index.js"],
        env: { API_KEY: "secret" },
        headers: {},
        requiredSecrets: [],
        verified: true,
      },
    ];

    const result = adapter.applyMcps(null, mcps, {}, { force: false }) as McpConfigResult;
    const testMcp = result.mcpServers["test-mcp"];
    expect(testMcp).toBeDefined();
    if (!testMcp) {
      throw new Error("Expected test-mcp to be present");
    }
    expect(testMcp.command).toBe("node");
    expect(testMcp.args).toEqual(["index.js"]);
    expect(testMcp.env).toEqual({ API_KEY: "secret" });
  });

  it("should inject secrets correctly", () => {
    const mcps: McpEntry[] = [
      {
        id: "sec-mcp",
        displayName: "Sec",
        runtime: "node",
        args: [],
        env: { KEY: "${secret:MY_KEY}", OTHER: "plain" },
        headers: {},
        requiredSecrets: ["MY_KEY"],
        verified: true,
      },
    ];

    const result = adapter.applyMcps(
      null,
      mcps,
      { MY_KEY: "12345" },
      { force: false },
    ) as McpConfigResult;
    const secMcp = result.mcpServers["sec-mcp"];
    expect(secMcp).toBeDefined();
    if (!secMcp) {
      throw new Error("Expected sec-mcp to be present");
    }
    expect(secMcp.env).toEqual({ KEY: "12345", OTHER: "plain" });
  });

  it("should serialize remote MCPs as http URLs", () => {
    const mcps: McpEntry[] = [
      {
        id: "remote-docs",
        displayName: "Remote Docs",
        runtime: "remote",
        url: "https://example.com/mcp",
        args: [],
        env: {},
        headers: {},
        requiredSecrets: [],
        verified: false,
      },
    ];

    const result = adapter.applyMcps(null, mcps, {}, { force: false }) as McpConfigResult;
    expect(result.mcpServers["remote-docs"]).toEqual({
      type: "http",
      url: "https://example.com/mcp",
    });
  });
});
