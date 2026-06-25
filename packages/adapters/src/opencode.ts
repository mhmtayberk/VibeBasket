import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { IdeId, McpEntry, RuleEntry, Scope, SkillEntry } from "../../core/src/manifest.js";
import { hasErrorCode, resolveSecretInterpolations } from "./mcp-utils";
import { getTargetCapabilities } from "./target-capabilities";
import type { IdeAdapter } from "./types";

interface OpenCodeMcpConfigEntry {
  type: "local" | "remote";
  enabled: boolean;
  command?: string[];
  environment?: Record<string, string>;
  url?: string;
}

interface OpenCodeConfig {
  mcp?: Record<string, OpenCodeMcpConfigEntry>;
  [key: string]: unknown;
}

function getOpenCodeSkillBaseDir(scope: Scope, projectRoot?: string) {
  return scope === "project" && projectRoot
    ? path.join(projectRoot, ".opencode", "skills")
    : path.join(
        process.env.XDG_CONFIG_HOME?.trim() || path.join(os.homedir(), ".config"),
        "opencode",
        "skills",
      );
}

function getOpenCodeRulesPath(scope: Scope, projectRoot?: string) {
  return scope === "project" && projectRoot
    ? path.join(projectRoot, "AGENTS.md")
    : path.join(
        process.env.XDG_CONFIG_HOME?.trim() || path.join(os.homedir(), ".config"),
        "opencode",
        "AGENTS.md",
      );
}

export class OpenCodeAdapter implements IdeAdapter {
  private static readonly capabilities = getTargetCapabilities("opencode");
  readonly id: IdeId = "opencode";
  readonly displayName = "OpenCode";
  readonly supportsMcp = OpenCodeAdapter.capabilities.supportsMcp;
  readonly supportsSkills = OpenCodeAdapter.capabilities.supportsSkills;
  readonly supportsRules = OpenCodeAdapter.capabilities.supportsRules;
  readonly supportedScopes: readonly Scope[] = OpenCodeAdapter.capabilities.supportedScopes;

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project" && projectRoot) {
      return path.join(projectRoot, "opencode.json");
    }
    return path.join(
      process.env.XDG_CONFIG_HOME?.trim() || path.join(os.homedir(), ".config"),
      "opencode",
      "opencode.json",
    );
  }

  async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    const file = this.configPath(scope, projectRoot);
    try {
      const content = await fs.readFile(file, "utf8");
      return JSON.parse(content) as OpenCodeConfig;
    } catch (error: unknown) {
      if (hasErrorCode(error, "ENOENT")) {
        return { mcp: {} } satisfies OpenCodeConfig;
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
    const current = (config as OpenCodeConfig) || { mcp: {} };
    const nextMcp = { ...(current.mcp || {}) };

    for (const mcp of mcps) {
      if (nextMcp[mcp.id] && !opts.force) {
        continue;
      }

      if (mcp.runtime === "remote") {
        nextMcp[mcp.id] = {
          type: "remote",
          enabled: true,
          ...(mcp.url ? { url: mcp.url } : {}),
        };
        continue;
      }

      nextMcp[mcp.id] = {
        type: "local",
        enabled: true,
        command: [mcp.command || mcp.runtime, ...(mcp.args || [])],
        ...(Object.keys(resolveSecretInterpolations(mcp.env, secrets)).length > 0
          ? { environment: resolveSecretInterpolations(mcp.env, secrets) }
          : {}),
      };
    }

    return {
      ...current,
      mcp: nextMcp,
    } satisfies OpenCodeConfig;
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    const baseDir = getOpenCodeSkillBaseDir(scope, projectRoot);
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
    const file = getOpenCodeRulesPath(scope, projectRoot);
    await fs.mkdir(path.dirname(file), { recursive: true });

    let content = "";
    try {
      content = await fs.readFile(file, "utf8");
    } catch (error: unknown) {
      if (!hasErrorCode(error, "ENOENT")) {
        throw error;
      }
    }

    for (const rule of rules) {
      const startTag = `<!-- >>> VIBEBASKET START: ${rule.id} <<< -->`;
      const endTag = `<!-- >>> VIBEBASKET END: ${rule.id} <<< -->`;
      const block = `${startTag}\n## ${rule.displayName}\n\n${rule.content}\n${endTag}`;
      const escapedStart = startTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const escapedEnd = endTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`);

      if (regex.test(content)) {
        content = content.replace(regex, block);
      } else {
        content = content.trim() ? `${content.trim()}\n\n${block}` : block;
      }
    }

    await fs.writeFile(file, `${content.trim()}\n`, "utf8");
  }

  async writeConfig(scope: Scope, config: unknown, projectRoot?: string): Promise<void> {
    const file = this.configPath(scope, projectRoot);
    await fs.mkdir(path.dirname(file), { recursive: true });

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

  async diff(_scope: Scope, pending: unknown): Promise<string> {
    return JSON.stringify(pending, null, 2);
  }

  postInstallHint(): string {
    return "Restart OpenCode or reload the TUI so MCP servers, AGENTS.md, and skills are reloaded.";
  }
}
