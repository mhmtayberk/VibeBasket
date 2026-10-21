import fs from "node:fs/promises";
import path from "node:path";
import type { IdeId, McpEntry, RuleEntry, Scope, SkillEntry } from "../../core/src/manifest.js";
import {
  hasErrorCode,
  mergeStandardMcpServers,
  readJsonFileOrDefault,
  writeJsonFileWithBackup,
} from "./mcp-utils";
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
    return path.join(projectRoot, ".mcp.json");
  }

  private instructionsPath(projectRoot: string): string {
    return path.join(projectRoot, ".github", "copilot-instructions.md");
  }

  async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    return readJsonFileOrDefault(this.configPath(scope, projectRoot), { mcpServers: {} });
  }

  applyMcps(
    config: unknown,
    mcps: McpEntry[],
    secrets: Record<string, string>,
    opts: { force: boolean },
  ): unknown {
    const current = (config as { mcpServers?: Record<string, unknown> }) || { mcpServers: {} };
    return {
      ...current,
      mcpServers: mergeStandardMcpServers(
        current.mcpServers as Parameters<typeof mergeStandardMcpServers>[0],
        mcps,
        secrets,
        opts,
      ),
    };
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    if (scope === "project" && projectRoot) {
      const instructionsFile = this.instructionsPath(projectRoot);
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
      const instructionsFile = this.instructionsPath(projectRoot);
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
    await writeJsonFileWithBackup(this.configPath(scope, projectRoot), config);
  }

  async diff(scope: Scope, pending: unknown, projectRoot?: string): Promise<string> {
    return JSON.stringify(pending, null, 2);
  }

  postInstallHint(): string {
    return "Restart the Copilot harness or reload VS Code so .mcp.json and project instructions are re-read.";
  }
}
