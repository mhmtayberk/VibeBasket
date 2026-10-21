import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { McpEntry, Scope } from "../../core/src/manifest.js";
import { BaseAdapter } from "./base-adapter";
import { hasErrorCode, resolveSecretInterpolations } from "./mcp-utils";

interface AutohandServer {
  name: string;
  transport: "stdio" | "http" | "sse";
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
  autoConnect?: boolean;
  [key: string]: unknown;
}

interface AutohandConfig {
  mcp?: { enabled?: boolean; servers?: AutohandServer[]; [key: string]: unknown };
  [key: string]: unknown;
}

export class AutohandAdapter extends BaseAdapter {
  readonly id = "autohand" as const;
  readonly displayName = "Autohand Code";

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".autohand", "config.json");
    }

    const configuredPath = process.env.AUTOHAND_CONFIG?.trim();
    if (configuredPath) {
      if (path.extname(configuredPath).toLowerCase() !== ".json") {
        throw new Error(
          "VibeBasket can only auto-apply Autohand MCP settings when AUTOHAND_CONFIG points to JSON.",
        );
      }
      return configuredPath;
    }

    return path.join(
      process.env.AUTOHAND_HOME?.trim() || path.join(os.homedir(), ".autohand"),
      "config.json",
    );
  }

  override async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    if (scope === "user" && !process.env.AUTOHAND_CONFIG?.trim()) {
      const home = process.env.AUTOHAND_HOME?.trim() || path.join(os.homedir(), ".autohand");
      for (const extension of ["toml", "yaml", "yml"]) {
        try {
          await fs.access(path.join(home, `config.${extension}`));
          throw new Error(
            `Autohand is using config.${extension}; VibeBasket will not create a competing config.json. Use a JSON config or apply the MCP entry manually.`,
          );
        } catch (error: unknown) {
          if (!hasErrorCode(error, "ENOENT")) throw error;
        }
      }
    }

    const current = (await super.readConfig(scope, projectRoot)) as AutohandConfig;
    return {
      ...current,
      mcp: {
        ...(current.mcp || {}),
        enabled: current.mcp?.enabled ?? true,
        servers: current.mcp?.servers || [],
      },
    } satisfies AutohandConfig;
  }

  override applyMcps(
    config: unknown,
    mcps: McpEntry[],
    secrets: Record<string, string>,
    opts: { force: boolean },
  ): unknown {
    const current = (config as AutohandConfig) || {};
    const servers = [...(current.mcp?.servers || [])];

    for (const mcp of mcps) {
      const index = servers.findIndex((server) => server.name === mcp.id);
      if (index >= 0 && !opts.force) continue;
      const env = resolveSecretInterpolations(mcp.env, secrets);
      const headers = resolveSecretInterpolations(mcp.headers || {}, secrets);
      const next: AutohandServer =
        mcp.runtime === "remote"
          ? {
              name: mcp.id,
              transport: "http",
              ...(mcp.url ? { url: mcp.url } : {}),
              ...(Object.keys(headers).length > 0 ? { headers } : {}),
              autoConnect: true,
            }
          : {
              name: mcp.id,
              transport: "stdio",
              command: mcp.command || mcp.runtime,
              args: mcp.args,
              ...(Object.keys(env).length > 0 ? { env } : {}),
              autoConnect: true,
            };
      if (index >= 0) servers[index] = next;
      else servers.push(next);
    }

    return {
      ...current,
      mcp: { ...(current.mcp || {}), enabled: true, servers },
    } satisfies AutohandConfig;
  }

  postInstallHint(): string {
    return "Run autohand mcp list to verify the connection, or restart Autohand Code.";
  }
}
