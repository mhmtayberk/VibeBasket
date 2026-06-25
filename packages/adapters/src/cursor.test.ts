import type { McpEntry } from "../../core/src/manifest.js";
import { describe, expect, it } from "vitest";
import { CursorAdapter } from "./cursor.js";
import type { McpConfigResult } from "./mcp-utils";

describe("CursorAdapter", () => {
  it("should merge new MCPs idempotently", () => {
    const adapter = new CursorAdapter();
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

  it("should not override existing MCPs unless forced", () => {
    const adapter = new CursorAdapter();
    const config = {
      mcpServers: {
        existing: {
          command: "node",
          args: ["index.js"],
        },
      },
    };

    const conflictMcp: McpEntry = {
      id: "existing",
      displayName: "Existing MCP",
      runtime: "npx",
      command: "npx",
      args: ["-y", "conflict"],
      env: {},
      headers: {},
      requiredSecrets: [],
      verified: false,
    };

    const resultWithoutForce = adapter.applyMcps(
      config,
      [conflictMcp],
      {},
      { force: false },
    ) as McpConfigResult;
    const existingWithoutForce = resultWithoutForce.mcpServers.existing;
    expect(existingWithoutForce).toBeDefined();
    if (!existingWithoutForce) {
      throw new Error("Expected existing MCP to remain present");
    }
    expect(existingWithoutForce.command).toBe("node");

    const resultWithForce = adapter.applyMcps(
      config,
      [conflictMcp],
      {},
      { force: true },
    ) as McpConfigResult;
    const existingWithForce = resultWithForce.mcpServers.existing;
    expect(existingWithForce).toBeDefined();
    if (!existingWithForce) {
      throw new Error("Expected existing MCP to be overwritten");
    }
    expect(existingWithForce.command).toBe("npx");
  });

  it("should resolve secrets in env vars", () => {
    const adapter = new CursorAdapter();
    const mcp: McpEntry = {
      id: "test",
      displayName: "Test",
      runtime: "npx",
      env: {
        API_KEY: "${secret:MY_API_KEY}",
        OTHER_VAR: "static_value",
      },
      args: [],
      headers: {},
      requiredSecrets: ["MY_API_KEY"],
      verified: false,
    };

    const result = adapter.applyMcps(
      {},
      [mcp],
      { MY_API_KEY: "secret123" },
      { force: false },
    ) as McpConfigResult;
    const testMcp = result.mcpServers.test;
    expect(testMcp).toBeDefined();
    if (!testMcp?.env) {
      throw new Error("Expected test MCP env to be present");
    }
    expect(testMcp.env.API_KEY).toBe("secret123");
    expect(testMcp.env.OTHER_VAR).toBe("static_value");
  });
});
