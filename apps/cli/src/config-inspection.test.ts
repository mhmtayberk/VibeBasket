import { describe, expect, it } from "vitest";
import {
  extractConfiguredMcpIds,
  resolveRuleVerificationTargets,
  resolveSkillVerificationTargets,
} from "./config-inspection.js";

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
});
