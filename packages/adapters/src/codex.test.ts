import type { McpEntry } from "@vibebasket/core";
import { describe, expect, it } from "vitest";
import { CodexAdapter } from "./codex.js";

describe("CodexAdapter", () => {
  it("supports project-scoped config paths", () => {
    expect(new CodexAdapter().configPath("project", "/tmp/demo")).toBe(
      "/tmp/demo/.codex/config.toml",
    );
  });

  it("maps remote secret headers into official Codex HTTP fields", () => {
    const adapter = new CodexAdapter();
    const pending = adapter.applyMcps(
      { mcpServers: {}, raw: "" },
      [
        {
          id: "mcp-context7",
          displayName: "Context7",
          runtime: "remote",
          args: [],
          env: {},
          headers: {
            Authorization: "${secret:CONTEXT7_TOKEN}",
            "X-Workspace": "shared",
          },
          requiredSecrets: ["CONTEXT7_TOKEN"],
          verified: false,
          url: "https://example.com/mcp",
        } satisfies McpEntry,
      ],
      { CONTEXT7_TOKEN: "token-value" },
      { force: false },
    ) as ReturnType<CodexAdapter["applyMcps"]> & {
      mcpServers: Record<string, Record<string, unknown>>;
    };

    expect(pending.mcpServers["mcp-context7"]).toMatchObject({
      url: "https://example.com/mcp",
      env_http_headers: {
        Authorization: "CONTEXT7_TOKEN",
      },
      http_headers: {
        "X-Workspace": "shared",
      },
    });
  });

  it("renders Codex-specific remote header fields into TOML", async () => {
    const adapter = new CodexAdapter();
    const diff = await adapter.diff("user", {
      raw: "",
      mcpServers: {
        "mcp-context7": {
          url: "https://example.com/mcp",
          env_http_headers: { Authorization: "CONTEXT7_TOKEN" },
          http_headers: { "X-Workspace": "shared" },
        },
      },
    });

    expect(diff).toContain("[mcp_servers.mcp-context7]");
    expect(diff).toContain('env_http_headers = { Authorization = "CONTEXT7_TOKEN" }');
    expect(diff).toContain('http_headers = { X-Workspace = "shared" }');
  });
});
