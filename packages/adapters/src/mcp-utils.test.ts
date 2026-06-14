import type { McpEntry } from "@vibebasket/core";
import { describe, expect, it } from "vitest";
import { toStandardMcpServerConfig } from "./mcp-utils.js";

describe("toStandardMcpServerConfig", () => {
  it("maps remote MCP entries to HTTP configs", () => {
    const mcp: McpEntry = {
      id: "remote-docs",
      displayName: "Remote Docs",
      runtime: "remote",
      url: "https://example.com/mcp",
      args: [],
      env: {},
      requiredSecrets: [],
      verified: false,
    };

    expect(toStandardMcpServerConfig(mcp, {})).toEqual({
      type: "http",
      url: "https://example.com/mcp",
    });
  });
});
