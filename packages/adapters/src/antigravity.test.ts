import { describe, expect, it } from "vitest";
import { AntigravityAdapter } from "./antigravity.js";
import os from "node:os";
import path from "node:path";
import type { McpEntry } from "@vibebasket/core";

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
        requiredSecrets: [],
        verified: true
      }
    ];

    const result = adapter.applyMcps(null, mcps, {}, { force: false }) as any;
    expect(result.mcpServers["test-mcp"]).toBeDefined();
    expect(result.mcpServers["test-mcp"].command).toBe("node");
    expect(result.mcpServers["test-mcp"].args).toEqual(["index.js"]);
    expect(result.mcpServers["test-mcp"].env).toEqual({ API_KEY: "secret" });
  });

  it("should inject secrets correctly", () => {
    const mcps: McpEntry[] = [
      {
        id: "sec-mcp",
        displayName: "Sec",
        runtime: "node",
        args: [],
        env: { KEY: "${secret:MY_KEY}", OTHER: "plain" },
        requiredSecrets: ["MY_KEY"],
        verified: true
      }
    ];

    const result = adapter.applyMcps(null, mcps, { MY_KEY: "12345" }, { force: false }) as any;
    expect(result.mcpServers["sec-mcp"].env).toEqual({ KEY: "12345", OTHER: "plain" });
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
        requiredSecrets: [],
        verified: false,
      },
    ];

    const result = adapter.applyMcps(null, mcps, {}, { force: false }) as any;
    expect(result.mcpServers["remote-docs"]).toEqual({
      type: "http",
      url: "https://example.com/mcp",
    });
  });
});
