import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { IdeId, McpEntry, Scope } from "@vibebasket/core";
import { type BasicMcpServerConfig, hasErrorCode } from "./mcp-utils";
import { getTargetCapabilities } from "./target-capabilities";
import type { IdeAdapter } from "./types";

interface CodexMcpConfig {
  mcpServers: Record<string, CodexServerConfig>;
  raw?: string;
}

interface CodexServerConfig extends BasicMcpServerConfig {
  cwd?: string;
  bearer_token_env_var?: string;
  http_headers?: Record<string, string>;
  env_http_headers?: Record<string, string>;
}

function extractSecretPlaceholder(value: string): string | null {
  const match = value.match(/^\$\{secret:([^}]+)\}$/);
  return match?.[1] ?? null;
}

function extractBearerSecretPlaceholder(value: string): string | null {
  const match = value.match(/^Bearer\s+\$\{secret:([^}]+)\}$/i);
  return match?.[1] ?? null;
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
      }),
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
    ([key, value]) => `${key} = ${serializeTomlString(value)}`,
  );
  return `{ ${entries.join(", ")} }`;
}

function parseCodexToml(content: string): Record<string, CodexServerConfig> {
  const result: Record<string, CodexServerConfig> = {};
  let currentName: string | null = null;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const sectionMatch = line.match(/^\[mcp_servers\.([^\]]+)\]$/);
    if (sectionMatch) {
      let name = sectionMatch[1] || "";
      // Strip outer double or single quotes if present
      if (
        (name.startsWith('"') && name.endsWith('"')) ||
        (name.startsWith("'") && name.endsWith("'"))
      ) {
        name = name.slice(1, -1);
      }
      currentName = name || null;
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

    if (
      key === "command" ||
      key === "url" ||
      key === "type" ||
      key === "cwd" ||
      key === "bearer_token_env_var"
    ) {
      target[key] = value.replace(/^"(.*)"$/, "$1");
    } else if (key === "args") {
      target.args = parseInlineArray(value);
    } else if (
      key === "env" ||
      key === "headers" ||
      key === "http_headers" ||
      key === "env_http_headers"
    ) {
      target[key] = parseInlineTable(value);
    }
  }

  return result;
}

function renderCodexToml(
  existingContent: string,
  mcpServers: Record<string, CodexServerConfig>,
): string {
  const keptLines: string[] = [];
  let skippingMcpSection = false;

  for (const rawLine of existingContent.split(/\r?\n/)) {
    const line = rawLine.trim();
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);

    if (sectionMatch) {
      const sectionName = sectionMatch[1] || "";
      const normalizedSectionName = sectionName.replace(/['"]/g, "");
      skippingMcpSection = normalizedSectionName.startsWith("mcp_servers.");
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
    if (server.cwd) {
      lines.push(`cwd = ${serializeTomlString(server.cwd)}`);
    }
    if (server.bearer_token_env_var) {
      lines.push(`bearer_token_env_var = ${serializeTomlString(server.bearer_token_env_var)}`);
    }
    if (server.type) {
      lines.push(`type = ${serializeTomlString(server.type)}`);
    }
    if (server.headers && Object.keys(server.headers).length > 0) {
      lines.push(`headers = ${serializeTomlInlineTable(server.headers)}`);
    }
    if (server.http_headers && Object.keys(server.http_headers).length > 0) {
      lines.push(`http_headers = ${serializeTomlInlineTable(server.http_headers)}`);
    }
    if (server.env_http_headers && Object.keys(server.env_http_headers).length > 0) {
      lines.push(`env_http_headers = ${serializeTomlInlineTable(server.env_http_headers)}`);
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

function toCodexServerConfig(
  mcp: McpEntry,
  secrets: Record<string, string>,
): CodexServerConfig {
  if (mcp.runtime !== "remote") {
    return {
      command: mcp.command || mcp.runtime,
      args: mcp.args,
      ...(Object.keys(mcp.env).length > 0
        ? {
            env: Object.fromEntries(
              Object.entries(mcp.env).map(([key, value]) => {
                const secretName = extractSecretPlaceholder(value);
                return [key, secretName ? (secrets[secretName] ?? value) : value];
              }),
            ),
          }
        : {}),
    };
  }

  const httpHeaders: Record<string, string> = {};
  const envHttpHeaders: Record<string, string> = {};
  let bearerTokenEnvVar: string | undefined;

  for (const [headerName, headerValue] of Object.entries(mcp.headers ?? {})) {
    const bearerSecret = extractBearerSecretPlaceholder(headerValue);
    if (headerName.toLowerCase() === "authorization" && bearerSecret) {
      bearerTokenEnvVar = bearerSecret;
      continue;
    }

    const secretName = extractSecretPlaceholder(headerValue);
    if (secretName) {
      envHttpHeaders[headerName] = secretName;
      continue;
    }

    const resolvedValue = Object.entries(secrets).reduce(
      (nextValue, [secretKey, secretValue]) =>
        nextValue.replace(`\${secret:${secretKey}}`, secretValue),
      headerValue,
    );
    httpHeaders[headerName] = resolvedValue;
  }

  return {
    ...(mcp.url ? { url: mcp.url } : {}),
    ...(bearerTokenEnvVar ? { bearer_token_env_var: bearerTokenEnvVar } : {}),
    ...(Object.keys(httpHeaders).length > 0 ? { http_headers: httpHeaders } : {}),
    ...(Object.keys(envHttpHeaders).length > 0 ? { env_http_headers: envHttpHeaders } : {}),
  };
}

export class CodexAdapter implements IdeAdapter {
  private static readonly capabilities = getTargetCapabilities("codex");
  readonly id: IdeId = "codex";
  readonly displayName = "Codex CLI";
  readonly supportsMcp = CodexAdapter.capabilities.supportsMcp;
  readonly supportsSkills = CodexAdapter.capabilities.supportsSkills;
  readonly supportsRules = CodexAdapter.capabilities.supportsRules;
  readonly supportedScopes: readonly Scope[] = CodexAdapter.capabilities.supportedScopes;

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) {
        throw new Error("projectRoot required for project scope");
      }

      return path.join(projectRoot, ".codex", "config.toml");
    }

    return path.join(os.homedir(), ".codex", "config.toml");
  }

  async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    const file = this.configPath(scope, projectRoot);
    try {
      const content = await fs.readFile(file, "utf8");
      return {
        mcpServers: parseCodexToml(content),
        raw: content,
      } satisfies CodexMcpConfig;
    } catch (error: unknown) {
      if (hasErrorCode(error, "ENOENT")) {
        return { mcpServers: {}, raw: "" } satisfies CodexMcpConfig;
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
    const current = (config as CodexMcpConfig) || { mcpServers: {}, raw: "" };
    const nextServers = { ...(current.mcpServers || {}) };

    for (const mcp of mcps) {
      if (nextServers[mcp.id] && !opts.force) {
        continue;
      }

      nextServers[mcp.id] = toCodexServerConfig(mcp, secrets);
    }

    return {
      ...current,
      mcpServers: nextServers,
    } satisfies CodexMcpConfig;
  }

  async writeConfig(scope: Scope, config: unknown, projectRoot?: string): Promise<void> {
    const file = this.configPath(scope, projectRoot);
    const dir = path.dirname(file);
    await fs.mkdir(dir, { recursive: true });

    const current = (config as CodexMcpConfig) || { mcpServers: {}, raw: "" };
    const existingContent = current.raw || "";

    try {
      const content = await fs.readFile(file, "utf8");
      await fs.writeFile(`${file}.bak.${Date.now()}`, content, "utf8");
    } catch (error: unknown) {
      if (!hasErrorCode(error, "ENOENT")) {
        throw error;
      }
    }

    await fs.writeFile(file, renderCodexToml(existingContent, current.mcpServers), "utf8");
  }

  async diff(scope: Scope, pending: unknown, _projectRoot?: string): Promise<string> {
    const current = (pending as CodexMcpConfig) || { mcpServers: {}, raw: "" };
    return renderCodexToml(current.raw || "", current.mcpServers);
  }

  postInstallHint(): string {
    return "Restart Codex CLI or the Codex IDE extension so updated MCP servers are discovered.";
  }
}
