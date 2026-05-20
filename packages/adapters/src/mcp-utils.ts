import fs from "node:fs/promises";
import path from "node:path";
import type { McpEntry } from "@vibebasket/core";

export interface BasicMcpServerConfig {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  type?: string;
  headers?: Record<string, string>;
}

export function resolveMcpEnv(
  source: Record<string, string>,
  secrets: Record<string, string>
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
  secrets: Record<string, string>
): BasicMcpServerConfig {
  if (mcp.runtime === "remote") {
    return {
      type: "http",
      ...(mcp.url ? { url: mcp.url } : {}),
    };
  }

  const env = resolveMcpEnv(mcp.env, secrets);
  return {
    command: mcp.command || mcp.runtime,
    args: mcp.args,
    ...(Object.keys(env).length > 0 ? { env } : {}),
  };
}

export function mergeStandardMcpServers(
  currentServers: Record<string, BasicMcpServerConfig> | undefined,
  mcps: McpEntry[],
  secrets: Record<string, string>,
  opts: { force: boolean }
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
  } catch (error: any) {
    if (error.code === "ENOENT") {
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
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  await fs.writeFile(file, JSON.stringify(config, null, 2), "utf8");
}
