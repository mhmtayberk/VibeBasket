import { describe, expect, it } from "vitest";
import { getLocalVibeBasketMcpSnippet } from "./local-mcp-snippets";

describe("local MCP snippets", () => {
  it("renders JSON shape for cursor", () => {
    const snippet = getLocalVibeBasketMcpSnippet("cursor");

    expect(snippet.format).toBe("json");
    expect(snippet.rootField).toBe("mcpServers");
    expect(snippet.snippet).toContain('"mcpServers"');
    expect(snippet.snippet).toContain('"vibebasket"');
  });

  it("renders YAML shape for continue", () => {
    const snippet = getLocalVibeBasketMcpSnippet("continue");

    expect(snippet.format).toBe("yaml");
    expect(snippet.rootField).toBe("mcpServers");
    expect(snippet.snippet).toContain("mcpServers:");
    expect(snippet.snippet).toContain("- name: vibebasket");
  });

  it("renders TOML shape for codex", () => {
    const snippet = getLocalVibeBasketMcpSnippet("codex");

    expect(snippet.format).toBe("toml");
    expect(snippet.rootField).toBe("mcp_servers.vibebasket");
    expect(snippet.snippet).toContain("[mcp_servers.vibebasket]");
    expect(snippet.snippet).toContain('command = "npx"');
  });
});
