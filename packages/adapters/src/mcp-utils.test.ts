import { describe, expect, it } from "vitest";
import type { McpEntry } from "../../core/src/manifest.js";
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
      headers: {},
      requiredSecrets: [],
      verified: false,
    };

    expect(toStandardMcpServerConfig(mcp, {})).toEqual({
      type: "http",
      url: "https://example.com/mcp",
    });
  });

  it("resolves remote header secrets into HTTP configs", () => {
    const mcp: McpEntry = {
      id: "remote-auth",
      displayName: "Remote Auth",
      runtime: "remote",
      url: "https://example.com/mcp",
      args: [],
      env: {},
      headers: {
        Authorization: "${secret:REMOTE_TOKEN}",
      },
      requiredSecrets: ["REMOTE_TOKEN"],
      verified: false,
    };

    expect(toStandardMcpServerConfig(mcp, { REMOTE_TOKEN: "Bearer abc123" })).toEqual({
      type: "http",
      url: "https://example.com/mcp",
      headers: {
        Authorization: "Bearer abc123",
      },
    });
  });
});
