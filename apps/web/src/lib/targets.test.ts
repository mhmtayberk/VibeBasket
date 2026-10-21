import {
  SUPPORTED_TARGET_IDS as ADAPTER_SUPPORTED_TARGET_IDS,
  TARGET_CAPABILITIES,
} from "@vibebasket/adapters";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_TARGET_IDS,
  RULES_SUPPORTED_TARGET_COUNT,
  SKILLS_SUPPORTED_TARGET_COUNT,
  SUPPORTED_TARGET_IDS,
  TARGET_OPTIONS,
  getSharedTargetScopes,
  resolvePreferredBundleScope,
} from "./targets";

describe("TARGET_OPTIONS", () => {
  it("keeps target ids unique", () => {
    const ids = TARGET_OPTIONS.map((target) => target.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only exposes supported ids in SUPPORTED_TARGET_IDS", () => {
    expect(SUPPORTED_TARGET_IDS).toEqual(
      TARGET_OPTIONS.filter((target) => target.status === "supported").map((target) => target.id),
    );
    expect(new Set(SUPPORTED_TARGET_IDS)).toEqual(new Set(ADAPTER_SUPPORTED_TARGET_IDS));
  });

  it("keeps targets alphabetically ordered by label", () => {
    expect(TARGET_OPTIONS.map((target) => target.label)).toEqual(
      [...TARGET_OPTIONS.map((target) => target.label)].sort((left, right) =>
        left.localeCompare(right),
      ),
    );
  });

  it("defaults target selection to Claude Code only", () => {
    expect(DEFAULT_TARGET_IDS).toEqual(["claude-code"]);
  });

  it("derives status and capabilities from the shared adapter registry", () => {
    for (const target of TARGET_OPTIONS) {
      expect(target.capabilities).toEqual(TARGET_CAPABILITIES[target.id]);
      expect(target.status).toBe(
        TARGET_CAPABILITIES[target.id].autoApply ? "supported" : "coming-soon",
      );
    }
  });

  it("adds DeepSeek-TUI as supported with MCP-only positioning", () => {
    expect(TARGET_OPTIONS.find((target) => target.id === "deepseek-tui")).toEqual(
      expect.objectContaining({
        label: "DeepSeek-TUI",
        status: "supported",
        note: expect.stringContaining("MCP config only"),
      }),
    );
    expect(TARGET_OPTIONS.some((target) => target.label === "DeepCode")).toBe(false);
    expect(TARGET_OPTIONS.some((target) => target.label === "Cherry Studio")).toBe(false);
  });
});

describe("target feature scopes", () => {
  it("counts only adapters that really implement skills and rules", () => {
    expect(SKILLS_SUPPORTED_TARGET_COUNT).toBe(22);
    expect(RULES_SUPPORTED_TARGET_COUNT).toBe(9);
  });

  it("keeps Ante MCP user-only while allowing skills at both scopes", () => {
    expect(getSharedTargetScopes(["ante"], { mcp: true })).toEqual(["user"]);
    expect(getSharedTargetScopes(["ante"], { skills: true })).toEqual(["user", "project"]);
    expect(getSharedTargetScopes(["ante"], { mcp: true, skills: true })).toEqual(["user"]);
  });

  it("keeps Trae MCP and rules project-only while allowing skills at both scopes", () => {
    expect(getSharedTargetScopes(["trae"], { mcp: true })).toEqual(["project"]);
    expect(getSharedTargetScopes(["trae"], { rules: true })).toEqual(["project"]);
    expect(getSharedTargetScopes(["trae"], { skills: true })).toEqual(["user", "project"]);
    expect(resolvePreferredBundleScope(["trae"], { mcp: true, skills: true })).toBe("project");
  });

  it("rejects a mixed scope that cannot satisfy every selected target and feature", () => {
    expect(getSharedTargetScopes(["ante", "trae"], { mcp: true, skills: true })).toEqual([]);
    expect(resolvePreferredBundleScope(["ante", "trae"], { mcp: true, skills: true })).toBeNull();
  });
});
