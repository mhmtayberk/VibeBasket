import fs from "node:fs/promises";
import path from "node:path";
import type { IdeId, McpEntry, RuleEntry, Scope, SkillEntry } from "../../core/src/manifest.js";
import { hasErrorCode, mergeStandardMcpServers } from "./mcp-utils";
import { getVsCodeGlobalStorageDir } from "./platform-paths";
import { getTargetCapabilities } from "./target-capabilities";
import type { IdeAdapter } from "./types";

export interface RooCodeMcpConfig {
  mcpServers?: Record<
    string,
    {
      command: string;
      args?: string[];
      env?: Record<string, string>;
      type?: string;
      url?: string;
      headers?: Record<string, string>;
    }
  >;
}

function getRooCodeGlobalBaseDir() {
  return path.dirname(getVsCodeGlobalStorageDir("RooVeterinaryInc.roo-cline"));
}

export class RooCodeAdapter implements IdeAdapter {
  private static readonly capabilities = getTargetCapabilities("roocode");
  readonly id: IdeId = "roocode";
  readonly displayName = "Roo Code";
  readonly supportsMcp = RooCodeAdapter.capabilities.supportsMcp;
  readonly supportsSkills = RooCodeAdapter.capabilities.supportsSkills;
  readonly supportsRules = RooCodeAdapter.capabilities.supportsRules;
  readonly supportedScopes: readonly Scope[] = RooCodeAdapter.capabilities.supportedScopes;

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) {
        throw new Error("projectRoot required for project scope");
      }
      return path.join(projectRoot, ".roo", "mcp.json");
    }

    return path.join(getVsCodeGlobalStorageDir("RooVeterinaryInc.roo-cline"), "mcp_settings.json");
  }

  async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    const file = this.configPath(scope, projectRoot);
    try {
      const content = await fs.readFile(file, "utf8");
      return JSON.parse(content);
    } catch (error: unknown) {
      if (hasErrorCode(error, "ENOENT")) {
        return { mcpServers: {} };
      }
      throw error;
    }
  }

  applyMcps(
    config: unknown,
    mcps: McpEntry[],
    secrets: Record<string, string>,
    opts: { force: boolean },
  ): unknown {
    const current = (config as RooCodeMcpConfig) || { mcpServers: {} };
    return {
      ...current,
      mcpServers: mergeStandardMcpServers(current.mcpServers || {}, mcps, secrets, opts),
    };
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    const baseDir =
      scope === "project" && projectRoot
        ? path.join(projectRoot, ".roo", "skills")
        : path.join(getRooCodeGlobalBaseDir(), "skills");

    await fs.mkdir(baseDir, { recursive: true });

    for (const skill of skills) {
      const skillDir = path.join(baseDir, skill.id);
      await fs.mkdir(skillDir, { recursive: true });

      const body =
        skill.source.type === "inline"
          ? skill.source.content
          : skill.source.type === "github"
            ? `Source: GitHub - ${skill.source.repo} (path: ${skill.source.path || "/"})`
            : `Source: npm - ${skill.source.package}`;

      await fs.writeFile(
        path.join(skillDir, "SKILL.md"),
        `---\nname: ${skill.id}\ndescription: ${skill.displayName}\n---\n\n${body}\n`,
        "utf8",
      );
    }
  }

  async applyRules(rules: RuleEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    const baseDir =
      scope === "project" && projectRoot
        ? path.join(projectRoot, ".roo", "rules")
        : path.join(getRooCodeGlobalBaseDir(), "rules");

    await fs.mkdir(baseDir, { recursive: true });

    for (const rule of rules) {
      await fs.writeFile(
        path.join(baseDir, `${rule.id}.md`),
        `# ${rule.displayName}\n\n${rule.content}\n`,
        "utf8",
      );
    }
  }

  async writeConfig(scope: Scope, config: unknown, projectRoot?: string): Promise<void> {
    const file = this.configPath(scope, projectRoot);
    const dir = path.dirname(file);
    await fs.mkdir(dir, { recursive: true });

    try {
      const content = await fs.readFile(file, "utf8");
      await fs.writeFile(`${file}.bak.${Date.now()}`, content, "utf8");
    } catch (error: unknown) {
      if (!hasErrorCode(error, "ENOENT")) {
        throw error;
      }
    }

    await fs.writeFile(file, JSON.stringify(config, null, 2), "utf8");
  }

  async diff(scope: Scope, pending: unknown, projectRoot?: string): Promise<string> {
    return JSON.stringify(pending, null, 2);
  }

  postInstallHint(): string {
    return "Restart Roo Code or reload the VS Code window for MCP, rules, and skills changes to take effect.";
  }
}
