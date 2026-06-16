import { describe, expect, it } from "vitest";
import { ZedAdapter } from "./zed.js";

describe("ZedAdapter", () => {
  it("writes MCP servers into context_servers for Zed compatibility", () => {
    const adapter = new ZedAdapter();

    const next = adapter.applyMcps(
      { context_servers: {} },
      [
        {
          id: "postgres",
          displayName: "Postgres",
          runtime: "npx",
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-postgres"],
          env: {},
          headers: {},
          requiredSecrets: [],
          verified: false,
        },
      ],
      {},
      { force: false },
    ) as { context_servers?: Record<string, unknown>; mcpServers?: Record<string, unknown> };

    expect(next.context_servers).toBeDefined();
    expect(next.context_servers?.postgres).toBeDefined();
    expect(next.mcpServers).toBeUndefined();
  });
});
