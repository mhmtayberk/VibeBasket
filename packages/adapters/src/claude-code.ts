import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { IdeId, McpEntry, Scope, SkillEntry } from "../../core/src/manifest.js";
import {
  type BasicMcpServerConfig,
  mergeStandardMcpServers,
  readJsonFileOrDefault,
  writeJsonFileWithBackup,
} from "./mcp-utils";
import { getTargetCapabilities } from "./target-capabilities";
import type { IdeAdapter } from "./types";

interface ClaudeProjectMcpConfig {
  mcpServers: Record<string, BasicMcpServerConfig>;
}

interface ClaudeUserConfig {
  mcpServers?: Record<string, BasicMcpServerConfig>;
  projects?: Record<string, { mcpServers?: Record<string, BasicMcpServerConfig> }>;
}

export class ClaudeCodeAdapter implements IdeAdapter {
  private static readonly capabilities = getTargetCapabilities("claude-code");
  readonly id: IdeId = "claude-code";
  readonly displayName = "Claude Code";
  readonly supportsMcp = ClaudeCodeAdapter.capabilities.supportsMcp;
  readonly supportsSkills = ClaudeCodeAdapter.capabilities.supportsSkills;
  readonly supportsRules = ClaudeCodeAdapter.capabilities.supportsRules;
  readonly supportedScopes: readonly Scope[] = ClaudeCodeAdapter.capabilities.supportedScopes;

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".mcp.json");
    }

    return path.join(os.homedir(), ".claude.json");
  }

  async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    const file = this.configPath(scope, projectRoot);
    return readJsonFileOrDefault(
      file,
      scope === "project" ? { mcpServers: {} } : { mcpServers: {}, projects: {} },
    );
  }

  applyMcps(
    config: unknown,
    mcps: McpEntry[],
    secrets: Record<string, string>,
    opts: { force: boolean },
  ): unknown {
    const current = (config as ClaudeUserConfig | ClaudeProjectMcpConfig) || { mcpServers: {} };

    if ("projects" in current) {
      return {
        ...current,
        mcpServers: mergeStandardMcpServers(current.mcpServers, mcps, secrets, opts),
      };
    }

    const projectConfig = (config as ClaudeProjectMcpConfig) || { mcpServers: {} };
    return {
      ...projectConfig,
      mcpServers: mergeStandardMcpServers(projectConfig.mcpServers, mcps, secrets, opts),
    };
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    const baseDir =
      scope === "project" && projectRoot
        ? path.join(projectRoot, ".claude", "skills")
        : path.join(os.homedir(), ".claude", "skills");
    await fs.mkdir(baseDir, { recursive: true });
    for (const skill of skills) {
      const skillDir = path.join(baseDir, skill.id);
      await fs.mkdir(skillDir, { recursive: true });
      const body =
        skill.source.type === "inline"
          ? skill.source.content
          : skill.source.type === "github"
            ? `Source: github.com/${skill.source.repo}${skill.source.path ? `/${skill.source.path}` : ""}`
            : `Source: npm ${skill.source.type === "npm" ? skill.source.package : "inline"}`;
      await fs.writeFile(
        path.join(skillDir, "SKILL.md"),
        `# ${skill.displayName}\n\n${body}`,
        "utf8",
      );
    }
  }

  async writeConfig(scope: Scope, config: unknown, projectRoot?: string): Promise<void> {
    const file = this.configPath(scope, projectRoot);
    await writeJsonFileWithBackup(file, config);
  }

  async diff(scope: Scope, pending: unknown): Promise<string> {
    return JSON.stringify(pending, null, 2);
  }

  postInstallHint(): string {
    return "Restart Claude Code or start a fresh session for MCP changes to load.";
  }
}
