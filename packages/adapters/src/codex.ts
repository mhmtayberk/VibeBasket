import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { IdeAdapter } from "./types";
import type { IdeId, McpEntry, Scope } from "@vibebasket/core";
import {
  mergeStandardMcpServers,
  type BasicMcpServerConfig,
} from "./mcp-utils";

interface CodexMcpConfig {
  mcpServers: Record<string, BasicMcpServerConfig>;
  raw?: string;
}

function parseInlineArray(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    return [];
  }

  const inner = trimmed.slice(1, -1).trim();
  if (!inner) {
    return [];
  }

  return inner
    .split(",")
    .map((part) => part.trim().replace(/^"(.*)"$/, "$1"))
    .filter(Boolean);
}

function parseInlineTable(value: string): Record<string, string> {
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    return {};
  }

  const inner = trimmed.slice(1, -1).trim();
  if (!inner) {
    return {};
  }

  return Object.fromEntries(
    inner
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .flatMap((part) => {
        const [rawKey, rawValue] = part.split("=").map((token) => token.trim());
        if (!rawKey || !rawValue) {
          return [];
        }
        return [[rawKey.replace(/^"(.*)"$/, "$1"), rawValue.replace(/^"(.*)"$/, "$1")] as const];
      })
  );
}

function serializeTomlString(value: string): string {
  return JSON.stringify(value);
}

function serializeTomlArray(values: string[]): string {
  return `[${values.map((value) => serializeTomlString(value)).join(", ")}]`;
}

function serializeTomlInlineTable(record: Record<string, string>): string {
  const entries = Object.entries(record).map(
    ([key, value]) => `${key} = ${serializeTomlString(value)}`
  );
  return `{ ${entries.join(", ")} }`;
}

function parseCodexToml(content: string): Record<string, BasicMcpServerConfig> {
  const result: Record<string, BasicMcpServerConfig> = {};
  let currentName: string | null = null;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const sectionMatch = line.match(/^\[mcp_servers\.([^\]]+)\]$/);
    if (sectionMatch) {
      currentName = sectionMatch[1] || null;
      if (currentName) {
        result[currentName] = result[currentName] || {};
      }
      continue;
    }

    if (!currentName) {
      continue;
    }

    const kvMatch = line.match(/^([A-Za-z0-9_]+)\s*=\s*(.+)$/);
    if (!kvMatch) {
      continue;
    }

    const [, key, rawValue] = kvMatch;
    const target = result[currentName];

    if (!target || !key || !rawValue) {
      continue;
    }
    const value = rawValue.trim();

    if (key === "command" || key === "url" || key === "type") {
      target[key] = value.replace(/^"(.*)"$/, "$1");
    } else if (key === "args") {
      target.args = parseInlineArray(value);
    } else if (key === "env" || key === "headers") {
      target[key] = parseInlineTable(value);
    }
  }

  return result;
}

function renderCodexToml(
  existingContent: string,
  mcpServers: Record<string, BasicMcpServerConfig>
): string {
  const keptLines: string[] = [];
  let skippingMcpSection = false;

  for (const rawLine of existingContent.split(/\r?\n/)) {
    const line = rawLine.trim();
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);

    if (sectionMatch) {
      const sectionName = sectionMatch[1] || "";
      skippingMcpSection = sectionName.startsWith("mcp_servers.");
      if (!skippingMcpSection) {
        keptLines.push(rawLine);
      }
      continue;
    }

    if (!skippingMcpSection) {
      keptLines.push(rawLine);
    }
  }

  const output = keptLines.join("\n").trimEnd();
  const blocks = Object.entries(mcpServers).map(([name, server]) => {
    const lines = [`[mcp_servers.${name}]`];
    if (server.command) {
      lines.push(`command = ${serializeTomlString(server.command)}`);
    }
    if (server.args?.length) {
      lines.push(`args = ${serializeTomlArray(server.args)}`);
    }
    if (server.env && Object.keys(server.env).length > 0) {
      lines.push(`env = ${serializeTomlInlineTable(server.env)}`);
    }
    if (server.url) {
      lines.push(`url = ${serializeTomlString(server.url)}`);
    }
    if (server.type) {
      lines.push(`type = ${serializeTomlString(server.type)}`);
    }
    if (server.headers && Object.keys(server.headers).length > 0) {
      lines.push(`headers = ${serializeTomlInlineTable(server.headers)}`);
    }
    return lines.join("\n");
  });

  const joinedBlocks = blocks.join("\n\n");
  if (!output) {
    return `${joinedBlocks}\n`;
  }

  if (!joinedBlocks) {
    return `${output}\n`;
  }

  return `${output}\n\n${joinedBlocks}\n`;
}

export class CodexAdapter implements IdeAdapter {
  readonly id: IdeId = "codex";
  readonly displayName = "Codex CLI";
  readonly supportsMcp = true;
  readonly supportsSkills = false;
  readonly supportsRules = true;
  readonly supportedScopes: readonly Scope[] = ["user"];

  configPath(scope: Scope): string {
    if (scope === "project") {
      throw new Error("Codex CLI support is currently limited to user scope");
    }

    return path.join(os.homedir(), ".codex", "config.toml");
  }

  async readConfig(scope: Scope): Promise<unknown> {
    const file = this.configPath(scope);
    try {
      const content = await fs.readFile(file, "utf8");
      return {
        mcpServers: parseCodexToml(content),
        raw: content,
      } satisfies CodexMcpConfig;
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return { mcpServers: {}, raw: "" } satisfies CodexMcpConfig;
      }
      throw error;
    }
  }

  applyMcps(
    config: unknown,
    mcps: McpEntry[],
    secrets: Record<string, string>,
    opts: { force: boolean }
  ): unknown {
    const current = (config as CodexMcpConfig) || { mcpServers: {}, raw: "" };
    return {
      ...current,
      mcpServers: mergeStandardMcpServers(current.mcpServers, mcps, secrets, opts),
    } satisfies CodexMcpConfig;
  }

  async writeConfig(scope: Scope, config: unknown): Promise<void> {
    const file = this.configPath(scope);
    const dir = path.dirname(file);
    await fs.mkdir(dir, { recursive: true });

    const current = (config as CodexMcpConfig) || { mcpServers: {}, raw: "" };
    const existingContent = current.raw || "";

    try {
      const content = await fs.readFile(file, "utf8");
      await fs.writeFile(`${file}.bak.${Date.now()}`, content, "utf8");
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    await fs.writeFile(file, renderCodexToml(existingContent, current.mcpServers), "utf8");
  }

  async diff(scope: Scope, pending: unknown): Promise<string> {
    const current = (pending as CodexMcpConfig) || { mcpServers: {}, raw: "" };
    return renderCodexToml(current.raw || "", current.mcpServers);
  }

  postInstallHint(): string {
    return "Restart Codex CLI or the Codex IDE extension so updated MCP servers are discovered.";
  }
}
