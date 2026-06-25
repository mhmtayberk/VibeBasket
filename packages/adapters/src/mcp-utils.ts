import fs from "node:fs/promises";
import path from "node:path";
import type { McpEntry } from "../../core/src/manifest.js";

export interface BasicMcpServerConfig {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  type?: string;
  headers?: Record<string, string>;
}

export interface McpConfigResult {
  mcpServers: Record<string, BasicMcpServerConfig>;
  [key: string]: unknown;
}

export function hasErrorCode(error: unknown, code: string): error is NodeJS.ErrnoException {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}

export function resolveSecretInterpolations(
  source: Record<string, string>,
  secrets: Record<string, string>,
): Record<string, string> {
  const resolved: Record<string, string> = {};

  for (const [key, value] of Object.entries(source)) {
    let nextValue = value;
    for (const [secretName, secretValue] of Object.entries(secrets)) {
      nextValue = nextValue.replace(`\${secret:${secretName}}`, secretValue);
    }
    resolved[key] = nextValue;
  }

  return resolved;
}

export function toStandardMcpServerConfig(
  mcp: McpEntry,
  secrets: Record<string, string>,
): BasicMcpServerConfig {
  const env = resolveSecretInterpolations(mcp.env, secrets);
  const headers = resolveSecretInterpolations(mcp.headers ?? {}, secrets);

  if (mcp.runtime === "remote") {
    return {
      type: "http",
      ...(mcp.url ? { url: mcp.url } : {}),
      ...(Object.keys(headers).length > 0 ? { headers } : {}),
    };
  }

  return {
    command: mcp.command || mcp.runtime,
    args: mcp.args,
    ...(Object.keys(env).length > 0 ? { env } : {}),
    ...(Object.keys(headers).length > 0 ? { headers } : {}),
  };
}

export function mergeStandardMcpServers(
  currentServers: Record<string, BasicMcpServerConfig> | undefined,
  mcps: McpEntry[],
  secrets: Record<string, string>,
  opts: { force: boolean },
): Record<string, BasicMcpServerConfig> {
  const nextServers = { ...(currentServers || {}) };

  for (const mcp of mcps) {
    if (nextServers[mcp.id] && !opts.force) {
      continue;
    }

    nextServers[mcp.id] = toStandardMcpServerConfig(mcp, secrets);
  }

  return nextServers;
}

export async function readJsonFileOrDefault<T>(file: string, fallback: T): Promise<T> {
  try {
    const content = await fs.readFile(file, "utf8");
    return JSON.parse(content) as T;
  } catch (error: unknown) {
    if (hasErrorCode(error, "ENOENT")) {
      return fallback;
    }
    throw error;
  }
}

export async function writeJsonFileWithBackup(file: string, config: unknown): Promise<void> {
  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true });

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
