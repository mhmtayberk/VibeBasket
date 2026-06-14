import fs from "node:fs/promises";
import path from "node:path";
import type { IdeId, McpEntry, RuleEntry, Scope, SkillEntry } from "@vibebasket/core";
import { hasErrorCode } from "./mcp-utils";
import { getTargetCapabilities } from "./target-capabilities";
import type { IdeAdapter } from "./types";

export class GitHubCopilotAdapter implements IdeAdapter {
  private static readonly capabilities = getTargetCapabilities("github-copilot");
  readonly id: IdeId = "github-copilot";
  readonly displayName = "GitHub Copilot";
  readonly supportsMcp = GitHubCopilotAdapter.capabilities.supportsMcp;
  readonly supportsSkills = GitHubCopilotAdapter.capabilities.supportsSkills;
  readonly supportsRules = GitHubCopilotAdapter.capabilities.supportsRules;
  readonly supportedScopes: readonly Scope[] = GitHubCopilotAdapter.capabilities.supportedScopes;

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope !== "project") {
      throw new Error("GitHub Copilot only supports 'project' scope configuration.");
    }
    if (!projectRoot) {
      throw new Error("projectRoot required for project scope");
    }
    return path.join(projectRoot, ".github", "copilot-instructions.md");
  }

  async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    const file = this.configPath(scope, projectRoot);
    try {
      return await fs.readFile(file, "utf8");
    } catch (error: unknown) {
      if (hasErrorCode(error, "ENOENT")) {
        return "";
      }
      throw error;
    }
  }

  applyMcps(
    config: unknown,
    _mcps: McpEntry[],
    _secrets: Record<string, string>,
    _opts: { force: boolean },
  ): unknown {
    // GitHub Copilot does not support MCP configuration
    return config;
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    if (scope === "project" && projectRoot) {
      const instructionsFile = this.configPath(scope, projectRoot);
      let content = "";
      try {
        content = await fs.readFile(instructionsFile, "utf8");
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

        const escapedStart = startTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const escapedEnd = endTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`);

        if (regex.test(content)) {
          content = content.replace(regex, blockContent);
        } else {
          content = content.trim() ? `${content.trim()}\n\n${blockContent}` : blockContent;
        }
      }

      await fs.mkdir(path.dirname(instructionsFile), { recursive: true });
      await fs.writeFile(instructionsFile, `${content.trim()}\n`, "utf8");
    }
  }

  async applyRules(rules: RuleEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    if (scope === "project" && projectRoot) {
      const instructionsFile = this.configPath(scope, projectRoot);
      let content = "";
      try {
        content = await fs.readFile(instructionsFile, "utf8");
      } catch (error: unknown) {
        if (!hasErrorCode(error, "ENOENT")) throw error;
      }

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

      await fs.mkdir(path.dirname(instructionsFile), { recursive: true });
      await fs.writeFile(instructionsFile, `${content.trim()}\n`, "utf8");
    }
  }

  async writeConfig(scope: Scope, config: unknown, projectRoot?: string): Promise<void> {
    const file = this.configPath(scope, projectRoot);
    const dir = path.dirname(file);
    await fs.mkdir(dir, { recursive: true });

    // Backup
    try {
      const content = await fs.readFile(file, "utf8");
      await fs.writeFile(`${file}.bak.${Date.now()}`, content, "utf8");
    } catch (error: unknown) {
      if (!hasErrorCode(error, "ENOENT")) throw error;
    }

    const contentToWrite = typeof config === "string" ? config : JSON.stringify(config, null, 2);
    await fs.writeFile(file, contentToWrite, "utf8");
  }

  async diff(scope: Scope, pending: unknown, projectRoot?: string): Promise<string> {
    const current = (await this.readConfig(scope, projectRoot)) as string;
    const pendingStr = typeof pending === "string" ? pending : JSON.stringify(pending, null, 2);
    return `--- Current\n+++ Pending\n${current}\n${pendingStr}`;
  }

  postInstallHint(): string {
    return "GitHub Copilot instructions will be read automatically by your Copilot extensions in this project.";
  }
}
