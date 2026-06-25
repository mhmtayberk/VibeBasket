import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { IdeId, McpEntry, RuleEntry, Scope, SkillEntry } from "../../core/src/manifest.js";
import { hasErrorCode, mergeStandardMcpServers } from "./mcp-utils";
import { getTargetCapabilities } from "./target-capabilities";
import type { IdeAdapter } from "./types";

export interface VoidMcpConfig {
  mcpServers?: Record<
    string,
    {
      command: string;
      args?: string[];
      env?: Record<string, string>;
    }
  >;
}

export class VoidAdapter implements IdeAdapter {
  private static readonly capabilities = getTargetCapabilities("void");
  readonly id: IdeId = "void";
  readonly displayName = "Void";
  readonly supportsMcp = VoidAdapter.capabilities.supportsMcp;
  readonly supportsSkills = VoidAdapter.capabilities.supportsSkills;
  readonly supportsRules = VoidAdapter.capabilities.supportsRules;
  readonly supportedScopes: readonly Scope[] = VoidAdapter.capabilities.supportedScopes;

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      throw new Error("Void Editor MCP configuration is only supported at user scope.");
    }

    if (os.platform() === "win32") {
      return path.join(os.homedir(), ".void-editor", "mcp.json");
    }
    return path.join(os.homedir(), ".void-editor", "mcp.json");
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
    const current = (config as VoidMcpConfig) || { mcpServers: {} };
    const mergedMcp = mergeStandardMcpServers(current.mcpServers || {}, mcps, secrets, opts);
    return {
      ...current,
      mcpServers: mergedMcp,
    };
  }

  private async writeInstructions(
    rulesFile: string,
    skills: SkillEntry[],
    rules: RuleEntry[],
  ): Promise<void> {
    let content = "";
    try {
      content = await fs.readFile(rulesFile, "utf8");
    } catch (error: unknown) {
      if (!hasErrorCode(error, "ENOENT")) throw error;
    }

    // Write skills
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

      const escapedStart = startTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const escapedEnd = endTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`);

      if (regex.test(content)) {
        content = content.replace(regex, blockContent);
      } else {
        content = content.trim() ? `${content.trim()}\n\n${blockContent}` : blockContent;
      }
    }

    // Write rules
    for (const rule of rules) {
      const startTag = `# >>> VIBEBASKET START: ${rule.id} <<<`;
      const endTag = `# >>> VIBEBASKET END: ${rule.id} <<<`;
      const blockContent = `${startTag}\n# Rule: ${rule.displayName} (${rule.id})\n${rule.content}\n${endTag}`;

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

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    if (scope === "project" && projectRoot) {
      // Write to both .voidrules and .clinerules to fully cover Void and VS Code extensions
      const voidRulesFile = path.join(projectRoot, ".voidrules");
      const clineRulesFile = path.join(projectRoot, ".clinerules");
      await this.writeInstructions(voidRulesFile, skills, []);
      await this.writeInstructions(clineRulesFile, skills, []);
    }
  }

  async applyRules(rules: RuleEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    if (scope === "project" && projectRoot) {
      const voidRulesFile = path.join(projectRoot, ".voidrules");
      const clineRulesFile = path.join(projectRoot, ".clinerules");
      await this.writeInstructions(voidRulesFile, [], rules);
      await this.writeInstructions(clineRulesFile, [], rules);
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
    return JSON.stringify(pending, null, 2);
  }

  postInstallHint(): string {
    return "Restart Void or reload the window for Void Editor changes to take effect.";
  }
}
