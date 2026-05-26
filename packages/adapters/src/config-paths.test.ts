import { describe, expect, it } from "vitest";
import { ClaudeCodeAdapter } from "./claude-code.js";
import { GeminiCliAdapter } from "./gemini-cli.js";
import { JunieAdapter } from "./junie.js";
import { KiroAdapter } from "./kiro.js";
import { ClineCliAdapter } from "./cline-cli.js";
import { ZedAdapter } from "./zed.js";
import { CodexAdapter } from "./codex.js";
import { TARGET_CAPABILITIES } from "./target-capabilities.js";

describe("adapter config paths", () => {
  it("uses documented project-scope paths for shared-config editors", () => {
    const projectRoot = "/tmp/demo-project";

    expect(new ClaudeCodeAdapter().configPath("project", projectRoot)).toBe("/tmp/demo-project/.mcp.json");
    expect(new GeminiCliAdapter().configPath("project", projectRoot)).toBe("/tmp/demo-project/.gemini/settings.json");
    expect(new JunieAdapter().configPath("project", projectRoot)).toBe("/tmp/demo-project/.junie/mcp/mcp.json");
    expect(new KiroAdapter().configPath("project", projectRoot)).toBe("/tmp/demo-project/.kiro/settings/mcp.json");
    expect(new ZedAdapter().configPath("project", projectRoot)).toBe("/tmp/demo-project/.zed/settings.json");
  });

  it("restricts user-scope-only terminal adapters", () => {
    expect(new ClineCliAdapter().supportedScopes).toEqual(TARGET_CAPABILITIES["cline-cli"].supportedScopes);
    expect(new CodexAdapter().supportedScopes).toEqual(TARGET_CAPABILITIES.codex.supportedScopes);
  });
});
