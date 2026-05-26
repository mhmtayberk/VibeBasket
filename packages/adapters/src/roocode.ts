import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { IdeAdapter } from "./types";
import type { IdeId, McpEntry, RuleEntry, Scope, SkillEntry } from "@vibebasket/core";
import { mergeStandardMcpServers } from "./mcp-utils";
import { getTargetCapabilities } from "./target-capabilities";

export interface RooCodeMcpConfig {
  mcpServers?: Record<
    string,
    {
      command: string;
      args?: string[];
      env?: Record<string, string>;
    }
  >;
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
    // Roo Code global settings are stored in VS Code User globalStorage folder
    const platform = os.platform();
    let globalStorageDir = "";

    if (platform === "darwin") {
      globalStorageDir = path.join(
        os.homedir(),
        "Library",
        "Application Support",
        "Code",
        "User",
        "globalStorage",
        "roodev.rogue-dev",
        "settings"
      );
    } else if (platform === "win32") {
      globalStorageDir = path.join(
        os.homedir(),
        "AppData",
        "Roaming",
        "Code",
        "User",
        "globalStorage",
        "roodev.rogue-dev",
        "settings"
      );
    } else {
      globalStorageDir = path.join(
        os.homedir(),
        ".config",
        "Code",
        "User",
        "globalStorage",
        "roodev.rogue-dev",
        "settings"
      );
    }

    return path.join(globalStorageDir, "roocode_mcp_settings.json");
  }

  async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    const file = this.configPath(scope, projectRoot);
    try {
      const content = await fs.readFile(file, "utf8");
      return JSON.parse(content);
    } catch (e: any) {
      if (e.code === "ENOENT") {
        return { mcpServers: {} };
      }
      throw e;
    }
  }

  applyMcps(
    config: unknown,
    mcps: McpEntry[],
    secrets: Record<string, string>,
    opts: { force: boolean }
  ): unknown {
    const current = (config as RooCodeMcpConfig) || { mcpServers: {} };
    const mergedMcp = mergeStandardMcpServers(current.mcpServers || {}, mcps, secrets, opts);
    return {
      ...current,
      mcpServers: mergedMcp,
    };
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    if (scope === "project" && projectRoot) {
      const rulesFile = path.join(projectRoot, ".clinerules");
      let content = "";
      try {
        content = await fs.readFile(rulesFile, "utf8");
      } catch (e: any) {
        if (e.code !== "ENOENT") throw e;
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
        const escapedStart = startTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedEnd = endTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`);

        if (regex.test(content)) {
          content = content.replace(regex, blockContent);
        } else {
          content = content.trim() ? `${content.trim()}\n\n${blockContent}` : blockContent;
        }
      }

      await fs.mkdir(path.dirname(rulesFile), { recursive: true });
      await fs.writeFile(rulesFile, content.trim() + "\n", "utf8");
    }
  }

  async applyRules(rules: RuleEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    if (scope === "project" && projectRoot) {
      const rulesFile = path.join(projectRoot, ".clinerules");
      let content = "";
      try {
        content = await fs.readFile(rulesFile, "utf8");
      } catch (e: any) {
        if (e.code !== "ENOENT") throw e;
      }

      for (const rule of rules) {
        const startTag = `# >>> VIBEBASKET START: ${rule.id} <<<`;
        const endTag = `# >>> VIBEBASKET END: ${rule.id} <<<`;
        const blockContent = `${startTag}\n# Rule: ${rule.displayName} (${rule.id})\n${rule.content}\n${endTag}`;

        // Escape helper inline
        const escapedStart = startTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedEnd = endTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`);

        if (regex.test(content)) {
          content = content.replace(regex, blockContent);
        } else {
          content = content.trim() ? `${content.trim()}\n\n${blockContent}` : blockContent;
        }
      }

      await fs.mkdir(path.dirname(rulesFile), { recursive: true });
      await fs.writeFile(rulesFile, content.trim() + "\n", "utf8");
    }
  }

  async writeConfig(scope: Scope, config: unknown, projectRoot?: string): Promise<void> {
    const file = this.configPath(scope, projectRoot);
    const dir = path.dirname(file);
    await fs.mkdir(dir, { recursive: true });

    try {
      const content = await fs.readFile(file, "utf8");
      await fs.writeFile(`${file}.bak.${Date.now()}`, content, "utf8");
    } catch (e: any) {
      if (e.code !== "ENOENT") throw e;
    }

    await fs.writeFile(file, JSON.stringify(config, null, 2), "utf8");
  }

  async diff(scope: Scope, pending: unknown, projectRoot?: string): Promise<string> {
    const current = await this.readConfig(scope, projectRoot);
    return JSON.stringify(pending, null, 2);
  }

  postInstallHint(): string {
    return "Restart VS Code or reload the window for Roo Code changes to take effect.";
  }
}
