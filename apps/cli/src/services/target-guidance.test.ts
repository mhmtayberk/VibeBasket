import { describe, expect, it } from "vitest";
import { getTargetMcpSnippet, getTargetSetupGuide, listTargetGuides } from "./target-guidance.js";

describe("target guidance", () => {
  it("lists supported targets in alphabetical order", () => {
    const targets = listTargetGuides();
    expect(targets).toHaveLength(24);
    expect(targets[0]?.label).toBe("Aider");
    expect(targets.at(-1)?.label).toBe("Zed");
  });

  it("returns MCP setup guidance for a target that supports MCP", () => {
    const guide = getTargetSetupGuide("cursor", "project");

    expect(guide.scopeSupported).toBe(true);
    expect(guide.supportsMcp).toBe(true);
    expect(guide.configPathHint).toBe("<project-root>/.cursor/mcp.json");
    expect(guide.vibebasketServer).toMatchObject({
      serverId: "vibebasket",
      command: "npx",
      args: ["-y", "vibebasket", "mcp", "serve"],
    });
  });

  it("returns a non-MCP guide for capability-limited targets", () => {
    const guide = getTargetSetupGuide("github-copilot", "project");

    expect(guide.supportsMcp).toBe(false);
    expect(guide.vibebasketServer).toBeNull();
    expect(guide.recommendedSteps[0]).toContain("does not expose MCP");
  });

  it("returns a native JSON snippet for cursor", () => {
    const snippet = getTargetMcpSnippet("cursor", "project");

    expect(snippet.scopeSupported).toBe(true);
    expect(snippet.snippetLanguage).toBe("json");
    expect(snippet.rootField).toBe("mcpServers");
    expect(snippet.snippet).toContain('"mcpServers"');
    expect(snippet.snippet).toContain('"vibebasket"');
    expect(snippet.snippet).toContain('"command": "npx"');
  });

  it("returns a native TOML snippet for codex", () => {
    const snippet = getTargetMcpSnippet("codex", "user");

    expect(snippet.snippetLanguage).toBe("toml");
    expect(snippet.rootField).toBe("mcp_servers.vibebasket");
    expect(snippet.snippet).toContain("[mcp_servers.vibebasket]");
    expect(snippet.snippet).toContain('command = "npx"');
  });

  it("returns a native YAML snippet for continue", () => {
    const snippet = getTargetMcpSnippet("continue", "project");

    expect(snippet.snippetLanguage).toBe("yaml");
    expect(snippet.rootField).toBe("mcpServers");
    expect(snippet.snippet).toContain("mcpServers:");
    expect(snippet.snippet).toContain("- name: vibebasket");
  });

  it("reports unsupported MCP snippet requests honestly", () => {
    const snippet = getTargetMcpSnippet("github-copilot", "project");

    expect(snippet.supportsMcp).toBe(false);
    expect(snippet.snippet).toBeNull();
    expect(snippet.notes[0]).toContain("does not expose MCP");
  });
});
