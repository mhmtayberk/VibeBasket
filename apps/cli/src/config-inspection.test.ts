import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  extractConfiguredMcpIds,
  resolveRuleVerificationTargets,
  resolveSkillVerificationTargets,
} from "./config-inspection.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("config inspection", () => {
  it("extracts configured MCP ids from array and nonstandard adapter config shapes", () => {
    expect(
      extractConfiguredMcpIds({
        mcpServers: [{ name: "ctx7" }, { name: "filesystem" }],
      }),
    ).toEqual(["ctx7", "filesystem"]);

    expect(
      extractConfiguredMcpIds({
        mcp: { ctx7: { type: "remote" } },
      }),
    ).toEqual(["ctx7"]);

    expect(
      extractConfiguredMcpIds({
        extensions: { github: { type: "stdio" } },
      }),
    ).toEqual(["github"]);
  });

  it("uses the verified Roo Code and OpenCode skill/rule paths", () => {
    const rooSkillTarget = resolveSkillVerificationTargets("roocode", "project", "/tmp/demo", [
      {
        id: "publish-cli",
        displayName: "Publish CLI",
        source: { type: "inline", content: "x" },
        verified: true,
      },
    ])[0];
    expect(rooSkillTarget?.path).toBe("/tmp/demo/.roo/skills/publish-cli/SKILL.md");

    const rooRuleTarget = resolveRuleVerificationTargets("roocode", "project", "/tmp/demo", [
      { id: "always-on", displayName: "Always On", content: "x", verified: true },
    ])[0];
    expect(rooRuleTarget?.path).toBe("/tmp/demo/.roo/rules/always-on.md");

    const openCodeRuleTarget = resolveRuleVerificationTargets("opencode", "project", "/tmp/demo", [
      { id: "workspace", displayName: "Workspace", content: "x", verified: true },
    ])[0];
    expect(openCodeRuleTarget?.path).toBe("/tmp/demo/AGENTS.md");
  });

  it("respects XDG_CONFIG_HOME for OpenCode global verification paths", () => {
    vi.stubEnv("XDG_CONFIG_HOME", "/tmp/xdg");

    const openCodeSkillTarget = resolveSkillVerificationTargets("opencode", "user", undefined, [
      {
        id: "release-flow",
        displayName: "Release Flow",
        source: { type: "inline", content: "x" },
        verified: true,
      },
    ])[0];

    const openCodeRuleTarget = resolveRuleVerificationTargets("opencode", "user", undefined, [
      { id: "workspace", displayName: "Workspace", content: "x", verified: true },
    ])[0];

    expect(openCodeSkillTarget?.path).toBe(
      path.join("/tmp/xdg", "opencode", "skills", "release-flow", "SKILL.md"),
    );
    expect(openCodeRuleTarget?.path).toBe(path.join("/tmp/xdg", "opencode", "AGENTS.md"));
  });
});
