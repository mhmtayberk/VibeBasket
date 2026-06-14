import os from "node:os";
import { describe, expect, it } from "vitest";
import { ClaudeCodeAdapter } from "./claude-code.js";
import { ClineCliAdapter } from "./cline-cli.js";
import { CodexAdapter } from "./codex.js";
import { ContinueAdapter } from "./continue.js";
import { DeepSeekTuiAdapter } from "./deepseek-tui.js";
import { GeminiCliAdapter } from "./gemini-cli.js";
import { HermesAdapter } from "./hermes.js";
import { JunieAdapter } from "./junie.js";
import { KiroAdapter } from "./kiro.js";
import { OpenClawAdapter } from "./openclaw.js";
import { RooCodeAdapter } from "./roocode.js";
import { TARGET_CAPABILITIES } from "./target-capabilities.js";
import { ZedAdapter } from "./zed.js";

describe("adapter config paths", () => {
  it("uses documented project-scope paths for shared-config editors", () => {
    const projectRoot = "/tmp/demo-project";

    expect(new ClaudeCodeAdapter().configPath("project", projectRoot)).toBe(
      "/tmp/demo-project/.mcp.json",
    );
    expect(new GeminiCliAdapter().configPath("project", projectRoot)).toBe(
      "/tmp/demo-project/.gemini/settings.json",
    );
    expect(new JunieAdapter().configPath("project", projectRoot)).toBe(
      "/tmp/demo-project/.junie/mcp/mcp.json",
    );
    expect(new KiroAdapter().configPath("project", projectRoot)).toBe(
      "/tmp/demo-project/.kiro/settings/mcp.json",
    );
    expect(new ZedAdapter().configPath("project", projectRoot)).toBe(
      "/tmp/demo-project/.zed/settings.json",
    );
    expect(new ContinueAdapter().configPath("project", projectRoot)).toBe(
      "/tmp/demo-project/.continue/config.json",
    );
  });

  it("restricts user-scope-only terminal adapters", () => {
    expect(new ClineCliAdapter().supportedScopes).toEqual(
      TARGET_CAPABILITIES["cline-cli"].supportedScopes,
    );
    expect(new CodexAdapter().supportedScopes).toEqual(TARGET_CAPABILITIES.codex.supportedScopes);
    expect(new DeepSeekTuiAdapter().supportedScopes).toEqual(
      TARGET_CAPABILITIES["deepseek-tui"].supportedScopes,
    );
    expect(new DeepSeekTuiAdapter().configPath("user")).toBe(`${os.homedir()}/.deepseek/mcp.json`);
  });

  it("verifies user/project scopes for roocode, hermes, and openclaw", () => {
    expect(new RooCodeAdapter().supportedScopes).toEqual(["project"]);
    expect(new HermesAdapter().supportedScopes).toEqual(["project"]);
    expect(new OpenClawAdapter().supportedScopes).toEqual(["project"]);

    expect(new RooCodeAdapter().configPath("project")).toContain("roocode_mcp_settings.json");
    expect(new HermesAdapter().configPath("project")).toBe(`${os.homedir()}/.hermes/config.yaml`);
    expect(new OpenClawAdapter().configPath("project")).toBe(
      `${os.homedir()}/.openclaw/openclaw.json`,
    );
  });
});
