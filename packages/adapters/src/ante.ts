import os from "node:os";
import path from "node:path";
import type { McpEntry } from "../../core/src/manifest.js";
import { BaseAdapter } from "./base-adapter";
import { resolveSecretInterpolations } from "./mcp-utils";

interface AnteConfig {
  mcp_servers?: Record<string, Record<string, unknown>>;
  [key: string]: unknown;
}

export class AnteAdapter extends BaseAdapter {
  readonly id = "ante" as const;
  readonly displayName = "Ante";

  configPath(): string {
    return path.join(os.homedir(), ".ante", "settings.json");
  }

  override async readConfig(): Promise<unknown> {
    const current = (await super.readConfig("user")) as Record<string, unknown>;
    return {
      ...current,
      mcp_servers:
        (current.mcp_servers as Record<string, Record<string, unknown>> | undefined) ?? {},
    } satisfies AnteConfig;
  }

  override applyMcps(
    config: unknown,
    mcps: McpEntry[],
    secrets: Record<string, string>,
    opts: { force: boolean },
  ): unknown {
    const current = (config as AnteConfig) || { mcp_servers: {} };
    const next = { ...(current.mcp_servers || {}) };

    for (const mcp of mcps) {
      if (next[mcp.id] && !opts.force) continue;
      if (mcp.runtime === "remote") {
        next[mcp.id] = {
          transport: "streamable-http",
          ...(mcp.url ? { url: mcp.url } : {}),
        };
      } else {
        const env = resolveSecretInterpolations(mcp.env, secrets);
        next[mcp.id] = {
          transport: "stdio",
          command: mcp.command || mcp.runtime,
          args: mcp.args,
          ...(Object.keys(env).length > 0 ? { env } : {}),
        };
      }
    }

    return { ...current, mcp_servers: next } satisfies AnteConfig;
  }

  postInstallHint(): string {
    return "Restart Ante or start a new session so MCP tools are discovered.";
  }
}
