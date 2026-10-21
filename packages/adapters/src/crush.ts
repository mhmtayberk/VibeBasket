import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { McpEntry, Scope, SkillEntry } from "../../core/src/manifest.js";
import { applyAgentSkills } from "./agent-content";
import { hasErrorCode, resolveSecretInterpolations } from "./mcp-utils";
import { getTargetCapabilities } from "./target-capabilities";
import { type IdeAdapter, getFeatureScopes } from "./types";

const START = (id: string) => `# >>> VIBEBASKET MCP START: ${id} <<<`;
const END = (id: string) => `# >>> VIBEBASKET MCP END: ${id} <<<`;

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

function renderServer(mcp: McpEntry, secrets: Record<string, string>): string {
  const parts = ["mcp", "add", shellQuote(mcp.id)];
  if (mcp.runtime === "remote") {
    parts.push("--type", "http");
    if (mcp.url) parts.push("--url", shellQuote(mcp.url));
    for (const [key, value] of Object.entries(
      resolveSecretInterpolations(mcp.headers || {}, secrets),
    )) {
      parts.push("--header", shellQuote(key), shellQuote(value));
    }
  } else {
    parts.push("--type", "stdio", "--command", shellQuote(mcp.command || mcp.runtime));
    for (const arg of mcp.args) parts.push("--args", shellQuote(arg));
    for (const [key, value] of Object.entries(resolveSecretInterpolations(mcp.env, secrets))) {
      parts.push("--env", shellQuote(key), shellQuote(value));
    }
  }
  return `${START(mcp.id)}\n${parts.join(" ")}\n${END(mcp.id)}`;
}

export function resolveCrushSkillDir(): string {
  const configHome = process.env.XDG_CONFIG_HOME?.trim() || path.join(os.homedir(), ".config");
  return process.env.CRUSH_SKILLS_DIR?.trim() || path.join(configHome, "crush", "skills");
}

export class CrushAdapter implements IdeAdapter {
  private static readonly capabilities = getTargetCapabilities("crush");
  readonly id = "crush" as const;
  readonly displayName = "Crush";
  readonly supportsMcp = CrushAdapter.capabilities.supportsMcp;
  readonly supportsSkills = CrushAdapter.capabilities.supportsSkills;
  readonly supportsRules = CrushAdapter.capabilities.supportsRules;
  readonly supportedScopes = CrushAdapter.capabilities.supportedScopes;
  featureScopes(feature: "mcp" | "skills" | "rules") {
    return getFeatureScopes(CrushAdapter.capabilities, feature);
  }

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".crushrc");
    }
    const configuredPath = process.env.CRUSH_GLOBAL_CONFIG?.trim();
    if (configuredPath) return configuredPath;
    const configHome = process.env.XDG_CONFIG_HOME?.trim() || path.join(os.homedir(), ".config");
    return path.join(configHome, "crush", "crushrc");
  }

  async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    try {
      return await fs.readFile(this.configPath(scope, projectRoot), "utf8");
    } catch (error: unknown) {
      if (hasErrorCode(error, "ENOENT")) return "";
      throw error;
    }
  }

  applyMcps(
    config: unknown,
    mcps: McpEntry[],
    secrets: Record<string, string>,
    opts: { force: boolean },
  ): unknown {
    let content = typeof config === "string" ? config : "";
    for (const mcp of mcps) {
      const block = renderServer(mcp, secrets);
      const pattern = new RegExp(
        `${START(mcp.id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${END(mcp.id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
      );
      if (pattern.test(content)) {
        if (opts.force) content = content.replace(pattern, block);
      } else {
        content = content.trim() ? `${content.trimEnd()}\n\n${block}\n` : `${block}\n`;
      }
    }
    return content;
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string) {
    const baseDir =
      scope === "project"
        ? path.join(requireProjectRoot(projectRoot), ".crush", "skills")
        : resolveCrushSkillDir();
    return applyAgentSkills(skills, baseDir);
  }

  async writeConfig(scope: Scope, config: unknown, projectRoot?: string): Promise<void> {
    const file = this.configPath(scope, projectRoot);
    await fs.mkdir(path.dirname(file), { recursive: true });
    try {
      const current = await fs.readFile(file, "utf8");
      await fs.writeFile(`${file}.bak.${Date.now()}`, current, "utf8");
    } catch (error: unknown) {
      if (!hasErrorCode(error, "ENOENT")) throw error;
    }
    await fs.writeFile(file, typeof config === "string" ? config : "", "utf8");
  }

  async diff(_scope: Scope, pending: unknown): Promise<string> {
    return typeof pending === "string" ? pending : "";
  }

  postInstallHint(): string {
    return "Restart Crush; review crushrc first because it is trusted executable configuration.";
  }
}

function requireProjectRoot(projectRoot?: string): string {
  if (!projectRoot) throw new Error("projectRoot required for project scope");
  return projectRoot;
}
