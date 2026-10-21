import os from "node:os";
import path from "node:path";
import type { RuleEntry, Scope, SkillEntry } from "../../core/src/manifest.js";
import { applyAgentSkills, applyAlwaysRules } from "./agent-content";
import { BaseAdapter } from "./base-adapter";

export class TraeAdapter extends BaseAdapter {
  readonly id = "trae" as const;
  readonly displayName = "Trae";

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope !== "project") throw new Error("Trae MCP only supports project scope auto-apply.");
    if (!projectRoot) throw new Error("projectRoot required for project scope");
    return path.join(projectRoot, ".trae", "mcp.json");
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string) {
    const baseDir =
      scope === "project"
        ? path.join(requireProjectRoot(projectRoot), ".trae", "skills")
        : path.join(os.homedir(), ".trae", "skills");
    return applyAgentSkills(skills, baseDir);
  }

  async applyRules(rules: RuleEntry[], scope: Scope, projectRoot?: string) {
    if (scope !== "project") throw new Error("Trae rules only support project scope auto-apply.");
    return applyAlwaysRules(rules, path.join(requireProjectRoot(projectRoot), ".trae", "rules"));
  }

  postInstallHint(): string {
    return "Enable project-level MCP in Trae, then reload the workspace.";
  }
}

function requireProjectRoot(projectRoot?: string): string {
  if (!projectRoot) throw new Error("projectRoot required for project scope");
  return projectRoot;
}
