import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { IdeAdapter } from "./types";
import type { IdeId, McpEntry, Scope, SkillEntry } from "@vibebasket/core";
import { mergeStandardMcpServers } from "./mcp-utils";
import { getTargetCapabilities } from "./target-capabilities";

export interface ContinueMcpConfig {
  mcpServers?: Record<
    string,
    {
      command: string;
      args?: string[];
      env?: Record<string, string>;
    }
  >;
}

export class ContinueAdapter implements IdeAdapter {
  private static readonly capabilities = getTargetCapabilities("continue");
  readonly id: IdeId = "continue";
  readonly displayName = "Continue";
  readonly supportsMcp = ContinueAdapter.capabilities.supportsMcp;
  readonly supportsSkills = ContinueAdapter.capabilities.supportsSkills;
  readonly supportsRules = ContinueAdapter.capabilities.supportsRules;
  readonly supportedScopes: readonly Scope[] = ContinueAdapter.capabilities.supportedScopes;

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".continue", "config.json");
    }
    return path.join(os.homedir(), ".continue", "config.json");
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
    const current = (config as ContinueMcpConfig) || { mcpServers: {} };
    const mergedMcp = mergeStandardMcpServers(current.mcpServers || {}, mcps, secrets, opts);
    return {
      ...current,
      mcpServers: mergedMcp,
    };
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    const configFile = this.configPath(scope, projectRoot);
    const continueDir = path.dirname(configFile);
    const promptsDir = path.join(continueDir, "prompts");

    // Enforce prompts directory exists
    await fs.mkdir(promptsDir, { recursive: true });

    for (const skill of skills) {
      const promptFile = path.join(promptsDir, `${skill.id}.prompt`);
      
      let promptContent = "";
      if (skill.source.type === "inline") {
        promptContent = skill.source.content;
      } else if (skill.source.type === "github") {
        promptContent = `# ${skill.displayName}\n\nThis skill is loaded from GitHub: \`${skill.source.repo}${skill.source.path ? `/${skill.source.path}` : ""}\` (ref: \`${skill.source.ref || "main"}\`).`;
      } else if (skill.source.type === "npm") {
        promptContent = `# ${skill.displayName}\n\nThis skill is loaded from npm package: \`${skill.source.package}\` (version: \`${skill.source.version || "latest"}\`).`;
      }

      const fileBody = `---\nname: ${skill.displayName}\n---\n\n${promptContent}`;
      await fs.writeFile(promptFile, fileBody, "utf8");
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
    return "Restart your IDE or reload the window for Continue changes to take effect.";
  }
}
