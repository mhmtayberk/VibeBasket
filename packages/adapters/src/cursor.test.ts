import { describe, expect, it } from "vitest";
import { CursorAdapter } from "./cursor.js";
import type { McpEntry } from "@vibebasket/core";

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
      requiredSecrets: [],
      verified: false,
    };

    const result = adapter.applyMcps(config, [newMcp], {}, { force: false }) as any;
    expect(result.mcpServers.existing).toBeDefined();
    expect(result.mcpServers["new-mcp"]).toBeDefined();
    expect(result.mcpServers["new-mcp"].command).toBe("npx");
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
      requiredSecrets: [],
      verified: false,
    };

    const resultWithoutForce = adapter.applyMcps(config, [conflictMcp], {}, { force: false }) as any;
    expect(resultWithoutForce.mcpServers.existing.command).toBe("node");

    const resultWithForce = adapter.applyMcps(config, [conflictMcp], {}, { force: true }) as any;
    expect(resultWithForce.mcpServers.existing.command).toBe("npx");
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
      requiredSecrets: ["MY_API_KEY"],
      verified: false,
    };

    const result = adapter.applyMcps({}, [mcp], { MY_API_KEY: "secret123" }, { force: false }) as any;
    expect(result.mcpServers.test.env.API_KEY).toBe("secret123");
    expect(result.mcpServers.test.env.OTHER_VAR).toBe("static_value");
  });
});
