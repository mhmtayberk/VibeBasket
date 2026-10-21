import os from "node:os";
import path from "node:path";
import type { RuleEntry, Scope, SkillEntry } from "../../core/src/manifest.js";
import { applyAgentSkills, applyAlwaysRules } from "./agent-content";
import { BaseAdapter } from "./base-adapter";

export function resolveQoderConfigDir(): string {
  return process.env.QODER_CONFIG_DIR?.trim() || path.join(os.homedir(), ".qoder");
}

export class QoderAdapter extends BaseAdapter {
  readonly id = "qoder" as const;
  readonly displayName = "Qoder";

  private configDir(): string {
    return resolveQoderConfigDir();
  }

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".mcp.json");
    }
    return path.join(this.configDir(), "settings.json");
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string) {
    const baseDir =
      scope === "project"
        ? path.join(requireProjectRoot(projectRoot), ".qoder", "skills")
        : path.join(this.configDir(), "skills");
    return applyAgentSkills(skills, baseDir);
  }

  async applyRules(rules: RuleEntry[], scope: Scope, projectRoot?: string) {
    if (scope !== "project") throw new Error("Qoder rules only support project scope auto-apply.");
    return applyAlwaysRules(rules, path.join(requireProjectRoot(projectRoot), ".qoder", "rules"));
  }

  postInstallHint(): string {
    return "Run /mcp reload in Qoder CLI or start a new session.";
  }
}

function requireProjectRoot(projectRoot?: string): string {
  if (!projectRoot) throw new Error("projectRoot required for project scope");
  return projectRoot;
}
