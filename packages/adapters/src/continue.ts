import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { McpEntry, Scope, SkillEntry } from "../../core/src/manifest.js";
import { BaseAdapter } from "./base-adapter";
import { hasErrorCode, resolveSecretInterpolations } from "./mcp-utils";

interface ContinuePromptReference {
  uses: string;
}

interface ContinueMcpServerConfig {
  name: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  transport?: string;
  url?: string;
  requestOptions?: {
    headers?: Record<string, string>;
  };
}

interface ContinueConfig {
  mcpServers?: ContinueMcpServerConfig[];
  prompts?: ContinuePromptReference[];
}

function normalizeMcpServers(
  mcpServers: ContinueConfig["mcpServers"] | Record<string, ContinueMcpServerConfig> | undefined,
): ContinueMcpServerConfig[] {
  if (Array.isArray(mcpServers)) {
    return mcpServers;
  }

  if (mcpServers && typeof mcpServers === "object") {
    return Object.entries(mcpServers).map(([name, server]) => ({
      ...server,
      name: server.name || name,
    }));
  }

  return [];
}

export class ContinueAdapter extends BaseAdapter {
  readonly id = "continue" as const;
  readonly displayName = "Continue";

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".continue", "config.yaml");
    }
    return path.join(os.homedir(), ".continue", "config.yaml");
  }

  override async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    const file = this.configPath(scope, projectRoot);
    try {
      const content = await fs.readFile(file, "utf8");
      return this.parseYaml(content);
    } catch (error: unknown) {
      if (hasErrorCode(error, "ENOENT")) {
        return { mcpServers: [], prompts: [] } satisfies ContinueConfig;
      }
      throw error;
    }
  }

  override applyMcps(
    config: unknown,
    mcps: McpEntry[],
    secrets: Record<string, string>,
    opts: { force: boolean },
  ): unknown {
    const current = (config as ContinueConfig) || {};
    const merged = new Map<string, ContinueMcpServerConfig>();

    for (const server of normalizeMcpServers(current.mcpServers)) {
      merged.set(server.name, server);
    }

    for (const mcp of mcps) {
      if (merged.has(mcp.id) && !opts.force) {
        continue;
      }

      const env = resolveSecretInterpolations(mcp.env, secrets);
      const headers = resolveSecretInterpolations(mcp.headers ?? {}, secrets);

      if (mcp.runtime === "remote") {
        merged.set(mcp.id, {
          name: mcp.id,
          transport: "streamable-http",
          ...(mcp.url ? { url: mcp.url } : {}),
          ...(Object.keys(headers).length > 0 ? { requestOptions: { headers } } : {}),
        });
        continue;
      }

      merged.set(mcp.id, {
        name: mcp.id,
        command: mcp.command || mcp.runtime,
        ...(mcp.args && mcp.args.length > 0 ? { args: mcp.args } : {}),
        ...(Object.keys(env).length > 0 ? { env } : {}),
      });
    }

    return {
      ...current,
      mcpServers: [...merged.values()],
    } satisfies ContinueConfig;
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string): Promise<void> {
    const configFile = this.configPath(scope, projectRoot);
    const promptsDir = path.join(path.dirname(configFile), "prompts");
    await fs.mkdir(promptsDir, { recursive: true });

    const config = (await this.readConfig(scope, projectRoot)) as ContinueConfig;
    const existingPromptRefs = new Set((config.prompts || []).map((prompt) => prompt.uses));

    for (const skill of skills) {
      let promptContent = "";
      if (skill.source.type === "inline") {
        promptContent = skill.source.content;
      } else if (skill.source.type === "github") {
        promptContent = `# ${skill.displayName}\n\nThis skill is loaded from GitHub: \`${skill.source.repo}${skill.source.path ? `/${skill.source.path}` : ""}\` (ref: \`${skill.source.ref || "main"}\`).`;
      } else if (skill.source.type === "npm") {
        promptContent = `# ${skill.displayName}\n\nThis skill is loaded from npm package: \`${skill.source.package}\` (version: \`${skill.source.version || "latest"}\`).`;
      }
      const promptPath = path.join(promptsDir, `${skill.id}.prompt`);
      const fileBody = `---\nname: ${skill.displayName}\ninvokable: true\n---\n\n${promptContent}`;
      await fs.writeFile(promptPath, fileBody, "utf8");

      const uses = pathToFileURL(promptPath).toString();
      if (!existingPromptRefs.has(uses)) {
        existingPromptRefs.add(uses);
        config.prompts = [...(config.prompts || []), { uses }];
      }
    }

    await this.writeConfig(scope, config, projectRoot);
  }

  override async writeConfig(scope: Scope, config: unknown, projectRoot?: string): Promise<void> {
    const file = this.configPath(scope, projectRoot);
    const dir = path.dirname(file);
    await fs.mkdir(dir, { recursive: true });

    let existingContent = "";
    try {
      existingContent = await fs.readFile(file, "utf8");
      await fs.writeFile(`${file}.bak.${Date.now()}`, existingContent, "utf8");
    } catch (error: unknown) {
      if (!hasErrorCode(error, "ENOENT")) {
        throw error;
      }
    }

    await fs.writeFile(file, this.serializeYaml(config as ContinueConfig, existingContent), "utf8");
  }

  postInstallHint(): string {
    return "Restart your IDE or reload the window for Continue changes to take effect.";
  }

  private parseYaml(yaml: string): ContinueConfig {
    const lines = yaml.split(/\r?\n/);
    const config: ContinueConfig = { mcpServers: [], prompts: [] };
    let section: "mcpServers" | "prompts" | null = null;
    let currentServer: ContinueMcpServerConfig | null = null;
    let listMode: "args" | "requestHeaders" | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const indent = line.search(/\S/);
      if (indent === 0) {
        section =
          trimmed === "mcpServers:" ? "mcpServers" : trimmed === "prompts:" ? "prompts" : null;
        currentServer = null;
        listMode = null;
        continue;
      }

      if (section === "mcpServers") {
        if (indent === 2 && trimmed.startsWith("- ")) {
          currentServer = { name: "" };
          config.mcpServers ||= [];
          config.mcpServers.push(currentServer);
          listMode = null;

          const inlineField = trimmed.slice(2).trim();
          if (inlineField.startsWith("name:")) {
            currentServer.name = this.unquote(inlineField.slice("name:".length).trim());
          }
          continue;
        }

        if (!currentServer) {
          continue;
        }

        if (indent === 4) {
          if (trimmed === "args:") {
            currentServer.args = [];
            listMode = "args";
            continue;
          }

          if (trimmed === "requestOptions:") {
            currentServer.requestOptions = currentServer.requestOptions || {};
            continue;
          }

          listMode = null;
          const [rawKey, ...rest] = trimmed.split(":");
          if (!rawKey) {
            continue;
          }
          const value = this.unquote(rest.join(":").trim());

          switch (rawKey) {
            case "name":
              currentServer.name = value;
              break;
            case "command":
              currentServer.command = value;
              break;
            case "cwd":
              currentServer.cwd = value;
              break;
            case "transport":
              currentServer.transport = value;
              break;
            case "url":
              currentServer.url = value;
              break;
          }
          continue;
        }

        if (indent === 6 && listMode === "args" && trimmed.startsWith("- ")) {
          currentServer.args ||= [];
          currentServer.args.push(this.unquote(trimmed.slice(2).trim()));
          continue;
        }

        if (indent === 6 && trimmed === "env:") {
          currentServer.env = currentServer.env || {};
          listMode = null;
          continue;
        }

        if (indent === 6 && trimmed === "headers:" && currentServer.requestOptions) {
          currentServer.requestOptions.headers ||= {};
          listMode = "requestHeaders";
          continue;
        }

        if (indent === 8 && currentServer.env && trimmed.includes(":")) {
          const [rawKey, ...rest] = trimmed.split(":");
          if (!rawKey) {
            continue;
          }
          currentServer.env[rawKey.trim()] = this.unquote(rest.join(":").trim());
          continue;
        }

        if (indent === 8 && listMode === "requestHeaders" && trimmed.includes(":")) {
          const [rawKey, ...rest] = trimmed.split(":");
          if (!rawKey) {
            continue;
          }
          currentServer.requestOptions ||= {};
          currentServer.requestOptions.headers ||= {};
          currentServer.requestOptions.headers[rawKey.trim()] = this.unquote(rest.join(":").trim());
        }
        continue;
      }

      if (section === "prompts" && indent === 2 && trimmed.startsWith("- uses:")) {
        config.prompts ||= [];
        config.prompts.push({
          uses: this.unquote(trimmed.slice("- uses:".length).trim()),
        });
      }
    }

    return config;
  }

  private serializeYaml(config: ContinueConfig, existingYaml: string): string {
    const lines = existingYaml.split(/\r?\n/);
    let output = "";
    let managedSection: "mcpServers" | "prompts" | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      const indent = line.search(/\S/);

      if (indent === 0 && (trimmed === "mcpServers:" || trimmed === "prompts:")) {
        managedSection = trimmed === "mcpServers:" ? "mcpServers" : "prompts";
        continue;
      }

      if (managedSection && indent > 0) {
        continue;
      }

      if (managedSection && (indent === 0 || trimmed === "")) {
        managedSection = null;
      }

      if (!managedSection) {
        output += `${line}\n`;
      }
    }

    const preserved = output.trimEnd();
    const header = preserved
      ? `${preserved}\n\n`
      : "name: VibeBasket\nversion: 1.0.0\nschema: v1\n\n";
    let serialized = header;

    serialized += "prompts:\n";
    for (const prompt of config.prompts || []) {
      serialized += `  - uses: ${this.quote(prompt.uses)}\n`;
    }

    serialized += "\nmcpServers:\n";
    for (const server of config.mcpServers || []) {
      serialized += `  - name: ${this.quote(server.name)}\n`;
      if (server.command) {
        serialized += `    command: ${this.quote(server.command)}\n`;
      }
      if (server.args?.length) {
        serialized += "    args:\n";
        for (const arg of server.args) {
          serialized += `      - ${this.quote(arg)}\n`;
        }
      }
      if (server.cwd) {
        serialized += `    cwd: ${this.quote(server.cwd)}\n`;
      }
      if (server.transport) {
        serialized += `    transport: ${this.quote(server.transport)}\n`;
      }
      if (server.url) {
        serialized += `    url: ${this.quote(server.url)}\n`;
      }
      if (server.env && Object.keys(server.env).length > 0) {
        serialized += "    env:\n";
        for (const [key, value] of Object.entries(server.env)) {
          serialized += `      ${key}: ${this.quote(value)}\n`;
        }
      }
      if (server.requestOptions?.headers && Object.keys(server.requestOptions.headers).length > 0) {
        serialized += "    requestOptions:\n";
        serialized += "      headers:\n";
        for (const [key, value] of Object.entries(server.requestOptions.headers)) {
          serialized += `        ${key}: ${this.quote(value)}\n`;
        }
      }
    }

    return `${serialized.trimEnd()}\n`;
  }

  private quote(value: string): string {
    return JSON.stringify(value);
  }

  private unquote(value: string): string {
    const trimmed = value.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }
}
