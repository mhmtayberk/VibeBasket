import fs from "node:fs/promises";
import path from "node:path";
import type { IdeAdapter } from "./types";
import type { IdeId, McpEntry, RuleEntry, Scope, SkillEntry } from "@vibebasket/core";
import { getTargetCapabilities } from "./target-capabilities";

export class AiderAdapter implements IdeAdapter {
  private static readonly capabilities = getTargetCapabilities("aider");
  readonly id: IdeId = "aider";
  readonly displayName = "Aider";
  readonly supportsMcp = AiderAdapter.capabilities.supportsMcp;
  readonly supportsSkills = AiderAdapter.capabilities.supportsSkills;
  readonly supportsRules = AiderAdapter.capabilities.supportsRules;
  readonly supportedScopes: readonly Scope[] = AiderAdapter.capabilities.supportedScopes;

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope !== "project") {
      throw new Error("Aider only supports 'project' scope configuration.");
    }
    if (!projectRoot) {
      throw new Error("projectRoot required for project scope");
    }
    return path.join(projectRoot, ".aider.conf.yml");
  }

  async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    const file = this.configPath(scope, projectRoot);
    try {
      return await fs.readFile(file, "utf8");
    } catch (e: any) {
      if (e.code === "ENOENT") {
        return "";
      }
      throw e;
    }
  }

  applyMcps(
    config: unknown,
    _mcps: McpEntry[],
    _secrets: Record<string, string>,
    _opts: { force: boolean }
  ): unknown {
    return config;
  }

  /**
   * Idempotent YAML manipulation to inject the 'read' config rule for .aiderinstructions.md.
   * Preserves all user-written comments and structures perfectly.
   */
  private mergeAiderConfig(yamlContent: string): string {
    const targetFile = ".aiderinstructions.md";
    const trimmed = yamlContent.trim();

    if (!trimmed) {
      return `read:\n  - ${targetFile}\n`;
    }

    // Check if the target is already present in the yaml
    if (yamlContent.includes(targetFile)) {
      return yamlContent;
    }

    // Case 1: 'read' config exists as a single-line string, e.g. "read: my-conventions.md"
    const singleLineReadRegex = /^read:\s*['"]?([^'\n\r"]+)['"]?\s*$/m;
    const singleLineMatch = yamlContent.match(singleLineReadRegex);

    if (singleLineMatch && singleLineMatch[1]) {
      const existingFile = singleLineMatch[1].trim();
      const newBlock = `read:\n  - ${existingFile}\n  - ${targetFile}`;
      return yamlContent.replace(singleLineReadRegex, newBlock);
    }

    // Case 2: 'read:' exists as a block header (array format)
    const blockReadRegex = /^read:\s*$/m;
    if (blockReadRegex.test(yamlContent)) {
      // Find the read: section and inject our file right underneath it
      return yamlContent.replace(blockReadRegex, `read:\n  - ${targetFile}`);
    }

    // Case 3: 'read' parameter is completely missing. Add it to the end of the file.
    return `${trimmed}\n\nread:\n  - ${targetFile}\n`;
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    if (scope === "project" && projectRoot) {
      const instructionsFile = path.join(projectRoot, ".aiderinstructions.md");
      let content = "";
      try {
        content = await fs.readFile(instructionsFile, "utf8");
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

        const escapedStart = startTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedEnd = endTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`);

        if (regex.test(content)) {
          content = content.replace(regex, blockContent);
        } else {
          content = content.trim() ? `${content.trim()}\n\n${blockContent}` : blockContent;
        }
      }

      await fs.mkdir(path.dirname(instructionsFile), { recursive: true });
      await fs.writeFile(instructionsFile, content.trim() + "\n", "utf8");

      // Now configure the .aider.conf.yml file
      const configFile = this.configPath(scope, projectRoot);
      let configContent = "";
      try {
        configContent = await fs.readFile(configFile, "utf8");
      } catch (e: any) {
        if (e.code !== "ENOENT") throw e;
      }

      const updatedConfig = this.mergeAiderConfig(configContent);
      await fs.writeFile(configFile, updatedConfig, "utf8");
    }
  }

  async applyRules(rules: RuleEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    if (scope === "project" && projectRoot) {
      const instructionsFile = path.join(projectRoot, ".aiderinstructions.md");
      let content = "";
      try {
        content = await fs.readFile(instructionsFile, "utf8");
      } catch (e: any) {
        if (e.code !== "ENOENT") throw e;
      }

      for (const rule of rules) {
        const startTag = `# >>> VIBEBASKET START: ${rule.id} <<<`;
        const endTag = `# >>> VIBEBASKET END: ${rule.id} <<<`;
        const blockContent = `${startTag}\n# Rule: ${rule.displayName} (${rule.id})\n${rule.content}\n${endTag}`;

        const escapedStart = startTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedEnd = endTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`);

        if (regex.test(content)) {
          content = content.replace(regex, blockContent);
        } else {
          content = content.trim() ? `${content.trim()}\n\n${blockContent}` : blockContent;
        }
      }

      await fs.mkdir(path.dirname(instructionsFile), { recursive: true });
      await fs.writeFile(instructionsFile, content.trim() + "\n", "utf8");

      // Configure .aider.conf.yml
      const configFile = this.configPath(scope, projectRoot);
      let configContent = "";
      try {
        configContent = await fs.readFile(configFile, "utf8");
      } catch (e: any) {
        if (e.code !== "ENOENT") throw e;
      }

      const updatedConfig = this.mergeAiderConfig(configContent);
      await fs.writeFile(configFile, updatedConfig, "utf8");
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
    } catch (e: any) {
      if (e.code !== "ENOENT") throw e;
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
    return "Aider will automatically load the instructions inside .aiderinstructions.md on startup.";
  }
}
