import os from "node:os";
import path from "node:path";
import type { RuleEntry, Scope, SkillEntry } from "../../core/src/manifest.js";
import { applyAgentSkills, applyAlwaysRules } from "./agent-content";
import { BaseAdapter } from "./base-adapter";

export const OMP_MCP_SCHEMA_URL =
  "https://raw.githubusercontent.com/can1357/oh-my-pi/main/packages/coding-agent/src/config/mcp-schema.json";

export function resolveOmpAgentDir(): string {
  const hasOmpProfile = Object.hasOwn(process.env, "OMP_PROFILE");
  const requestedProfile = (
    hasOmpProfile ? process.env.OMP_PROFILE : process.env.PI_PROFILE
  )?.trim();
  const isDefaultProfile = !requestedProfile || requestedProfile === "default";
  const configuredRoot = process.env.PI_CONFIG_DIR?.trim();
  const ompRoot = configuredRoot
    ? path.isAbsolute(configuredRoot)
      ? configuredRoot
      : path.join(os.homedir(), configuredRoot)
    : path.join(os.homedir(), ".omp");

  if (isDefaultProfile) {
    return process.env.PI_CODING_AGENT_DIR?.trim() || path.join(ompRoot, "agent");
  }

  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(requestedProfile)) {
    throw new Error("OMP_PROFILE must be a simple profile name without path separators.");
  }

  return path.join(ompRoot, "profiles", requestedProfile, "agent");
}

export class OmpAdapter extends BaseAdapter {
  readonly id = "omp" as const;
  readonly displayName = "OMP (Oh My Pi)";

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".omp", "mcp.json");
    }
    return path.join(resolveOmpAgentDir(), "mcp.json");
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string) {
    const baseDir =
      scope === "project"
        ? path.join(requireProjectRoot(projectRoot), ".omp", "skills")
        : path.join(resolveOmpAgentDir(), "skills");
    return applyAgentSkills(skills, baseDir);
  }

  async applyRules(rules: RuleEntry[], scope: Scope, projectRoot?: string) {
    const baseDir =
      scope === "project"
        ? path.join(requireProjectRoot(projectRoot), ".omp", "rules")
        : path.join(resolveOmpAgentDir(), "rules");
    return applyAlwaysRules(rules, baseDir);
  }

  override async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    const current = (await super.readConfig(scope, projectRoot)) as Record<string, unknown>;
    return { $schema: OMP_MCP_SCHEMA_URL, ...current };
  }

  postInstallHint(): string {
    return "Run /mcp in OMP to verify the server, or start a new OMP session.";
  }
}

function requireProjectRoot(projectRoot?: string): string {
  if (!projectRoot) throw new Error("projectRoot required for project scope");
  return projectRoot;
}
