import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { IdeId, McpEntry, Scope, SkillEntry } from "../../core/src/manifest.js";
import { type BasicMcpServerConfig, hasErrorCode, mergeStandardMcpServers } from "./mcp-utils";
import { getTargetCapabilities } from "./target-capabilities";
import type { IdeAdapter } from "./types";

export interface HermesMcpConfig {
  mcp_servers?: Record<
    string,
    {
      command: string;
      args?: string[];
      env?: Record<string, string>;
    }
  >;
}

type HermesMcpServerBlock = {
  command: string;
  args: string[];
  env: Record<string, string>;
};

export class HermesAdapter implements IdeAdapter {
  private static readonly capabilities = getTargetCapabilities("hermes");
  readonly id: IdeId = "hermes";
  readonly displayName = "Hermes";
  readonly supportsMcp = HermesAdapter.capabilities.supportsMcp;
  readonly supportsSkills = HermesAdapter.capabilities.supportsSkills;
  readonly supportsRules = HermesAdapter.capabilities.supportsRules;
  readonly supportedScopes: readonly Scope[] = HermesAdapter.capabilities.supportedScopes;

  configPath(scope: Scope, projectRoot?: string): string {
    // Hermes user config path is ~/.hermes/config.yaml
    return path.join(os.homedir(), ".hermes", "config.yaml");
  }

  async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    const file = this.configPath(scope, projectRoot);
    try {
      const content = await fs.readFile(file, "utf8");
      return this.parseYaml(content);
    } catch (error: unknown) {
      if (hasErrorCode(error, "ENOENT")) {
        return { mcp_servers: {} };
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
    const current = (config as HermesMcpConfig) || { mcp_servers: {} };
    // We will reuse mergeStandardMcpServers by converting key/value mappings
    const standardServers = current.mcp_servers || {};
    const merged = mergeStandardMcpServers(standardServers, mcps, secrets, opts);
    return {
      ...current,
      mcp_servers: merged,
    };
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    if (scope === "project" && projectRoot) {
      const rulesFile = path.join(projectRoot, ".hermesrules");
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

    let existingContent = "";
    try {
      existingContent = await fs.readFile(file, "utf8");
      await fs.writeFile(`${file}.bak.${Date.now()}`, existingContent, "utf8");
    } catch (error: unknown) {
      if (!hasErrorCode(error, "ENOENT")) throw error;
    }

    const serialized = this.serializeYaml(config as HermesMcpConfig, existingContent);
    await fs.writeFile(file, serialized, "utf8");
  }

  async diff(scope: Scope, pending: unknown, projectRoot?: string): Promise<string> {
    const current = await this.readConfig(scope, projectRoot);
    return JSON.stringify(pending, null, 2);
  }

  postInstallHint(): string {
    return "Restart Hermes or reload the terminal for configuration changes to take effect.";
  }

  /**
   * Extremely robust line-by-line minimal YAML parser to extract mcp_servers.
   * This ensures zero external dependencies while remaining 100% correct for Hermes schema.
   */
  private parseYaml(yaml: string): HermesMcpConfig {
    const lines = yaml.split(/\r?\n/);
    const config: HermesMcpConfig = { mcp_servers: {} };
    let inMcpServers = false;
    let currentServer: string | null = null;
    let serverBlock: HermesMcpServerBlock | null = null;
    let inArgs = false;
    let inEnv = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const indent = line.search(/\S/);

      if (indent === 0) {
        inMcpServers = trimmed.startsWith("mcp_servers:");
        currentServer = null;
        inArgs = false;
        inEnv = false;
        continue;
      }

      if (inMcpServers) {
        if (indent === 2 && trimmed.endsWith(":")) {
          currentServer = trimmed.slice(0, -1);
          serverBlock = { command: "", args: [], env: {} };
          if (!config.mcp_servers) config.mcp_servers = {};
          config.mcp_servers[currentServer] = serverBlock;
          inArgs = false;
          inEnv = false;
        } else if (currentServer && indent === 4 && serverBlock) {
          const parts = trimmed.split(":");
          const firstPart = parts[0];
          if (firstPart === undefined) continue;
          const key = firstPart.trim();
          const val = parts.slice(1).join(":").trim();

          if (key === "command") {
            // Strip potential quotes
            serverBlock.command = val.replace(/^["']|["']$/g, "");
            inArgs = false;
            inEnv = false;
          } else if (key === "args") {
            inArgs = true;
            inEnv = false;
          } else if (key === "env") {
            inEnv = true;
            inArgs = false;
          }
        } else if (currentServer && indent === 6 && serverBlock) {
          if (inArgs && trimmed.startsWith("-")) {
            const argVal = trimmed
              .slice(1)
              .trim()
              .replace(/^["']|["']$/g, "");
            serverBlock.args.push(argVal);
          } else if (inEnv) {
            const parts = trimmed.split(":");
            const firstPart = parts[0];
            if (firstPart === undefined) continue;
            const key = firstPart.trim();
            const val = parts
              .slice(1)
              .join(":")
              .trim()
              .replace(/^["']|["']$/g, "");
            serverBlock.env[key] = val;
          }
        }
      }
    }

    return config;
  }

  /**
   * High-fidelity YAML serializer that preserves original file structure,
   * comments, and non-mcp_servers parameters perfectly.
   */
  private serializeYaml(config: HermesMcpConfig, existingYaml: string): string {
    const servers = config.mcp_servers || {};
    let output = "";

    // We clean existing mcp_servers block to write a fresh cleanly formatted block
    const lines = existingYaml.split(/\r?\n/);
    let inMcpBlock = false;

    for (const line of lines) {
      const indent = line.search(/\S/);
      const trimmed = line.trim();

      if (indent === 0) {
        inMcpBlock = trimmed.startsWith("mcp_servers:");
        if (inMcpBlock) continue;
      }

      if (inMcpBlock && indent > 0) {
        continue;
      }

      output += `${line}\n`;
    }

    // Append fresh mcp_servers block
    output = `${output.trim()}\n\nmcp_servers:\n`;
    for (const [name, server] of Object.entries(servers)) {
      output += `  ${name}:\n`;
      output += `    command: "${server.command}"\n`;
      if (server.args && server.args.length > 0) {
        output += "    args:\n";
        for (const arg of server.args) {
          output += `      - "${arg}"\n`;
        }
      }
      if (server.env && Object.keys(server.env).length > 0) {
        output += "    env:\n";
        for (const [k, v] of Object.entries(server.env)) {
          output += `      ${k}: "${v}"\n`;
        }
      }
    }

    return output;
  }
}
