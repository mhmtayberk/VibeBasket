import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { IdeId, McpEntry, Scope, SkillEntry } from "../../core/src/manifest.js";
import { hasErrorCode, mergeStandardMcpServers } from "./mcp-utils";
import { getTargetCapabilities } from "./target-capabilities";
import type { IdeAdapter } from "./types";

export interface OpenClawMcpConfig {
  "mcp.servers"?: Record<
    string,
    {
      command: string;
      args?: string[];
      env?: Record<string, string>;
    }
  >;
}

export class OpenClawAdapter implements IdeAdapter {
  private static readonly capabilities = getTargetCapabilities("openclaw");
  readonly id: IdeId = "openclaw";
  readonly displayName = "OpenClaw";
  readonly supportsMcp = OpenClawAdapter.capabilities.supportsMcp;
  readonly supportsSkills = OpenClawAdapter.capabilities.supportsSkills;
  readonly supportsRules = OpenClawAdapter.capabilities.supportsRules;
  readonly supportedScopes: readonly Scope[] = OpenClawAdapter.capabilities.supportedScopes;

  configPath(scope: Scope, projectRoot?: string): string {
    // OpenClaw user configuration is typically ~/.openclaw/openclaw.json
    return path.join(os.homedir(), ".openclaw", "openclaw.json");
  }

  async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    const file = this.configPath(scope, projectRoot);
    try {
      const content = await fs.readFile(file, "utf8");
      return JSON.parse(content);
    } catch (error: unknown) {
      if (hasErrorCode(error, "ENOENT")) {
        return { "mcp.servers": {} };
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
    const current = (config as OpenClawMcpConfig) || { "mcp.servers": {} };
    const standardServers = current["mcp.servers"] || {};
    const mergedMcp = mergeStandardMcpServers(standardServers, mcps, secrets, opts);
    return {
      ...current,
      "mcp.servers": mergedMcp,
    };
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    if (scope === "project" && projectRoot) {
      const rulesFile = path.join(projectRoot, ".openclawrules");
      let content = "";
      try {
        content = await fs.readFile(rulesFile, "utf8");
      } catch (error: unknown) {
        if (!hasErrorCode(error, "ENOENT")) throw error;
      }

      for (const skill of skills) {
        let body = "";
        if (skill.source.type === "inline") {
          body = skill.source.content;
        } else if (skill.source.type === "github") {
          body = `Source: GitHub - ${skill.source.repo} (path: ${skill.source.path || "/"})`;
        } else if (skill.source.type === "npm") {
          body = `Source: npm - ${skill.source.package}`;
        }

        const startTag = `# >>> VIBEBASKET START: ${skill.id} <<<`;
        const endTag = `# >>> VIBEBASKET END: ${skill.id} <<<`;
        const blockContent = `${startTag}\n# Skill: ${skill.displayName} (${skill.id})\n${body}\n${endTag}`;

        // Escape helper inline
        const escapedStart = startTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const escapedEnd = endTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`);

        if (regex.test(content)) {
          content = content.replace(regex, blockContent);
        } else {
          content = content.trim() ? `${content.trim()}\n\n${blockContent}` : blockContent;
        }
      }

      await fs.mkdir(path.dirname(rulesFile), { recursive: true });
      await fs.writeFile(rulesFile, `${content.trim()}\n`, "utf8");
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
      if (!hasErrorCode(error, "ENOENT")) throw error;
    }

    await fs.writeFile(file, JSON.stringify(config, null, 2), "utf8");
  }

  async diff(scope: Scope, pending: unknown, projectRoot?: string): Promise<string> {
    const current = await this.readConfig(scope, projectRoot);
    return JSON.stringify(pending, null, 2);
  }

  postInstallHint(): string {
    return "Restart OpenClaw for config updates to take effect.";
  }
}
