import os from "node:os";
import path from "node:path";
import type { McpEntry, Scope, SkillEntry } from "../../core/src/manifest.js";
import { applyAgentSkills } from "./agent-content";
import { BaseAdapter } from "./base-adapter";
import { resolveSecretInterpolations } from "./mcp-utils";

interface AnteConfig {
  mcp_servers?: Record<string, Record<string, unknown>>;
  [key: string]: unknown;
}

export function resolveAnteHomeDir(): string {
  return process.env.ANTE_HOME?.trim() || path.join(os.homedir(), ".ante");
}

export class AnteAdapter extends BaseAdapter {
  readonly id = "ante" as const;
  readonly displayName = "Ante";

  private homeDir(): string {
    return resolveAnteHomeDir();
  }

  configPath(scope: Scope = "user"): string {
    if (scope !== "user") throw new Error("Ante MCP only supports user scope auto-apply.");
    return path.join(this.homeDir(), "settings.json");
  }

  override async readConfig(): Promise<unknown> {
    const current = (await super.readConfig("user")) as Record<string, unknown>;
    return {
      ...current,
      mcp_servers:
        (current.mcp_servers as Record<string, Record<string, unknown>> | undefined) ?? {},
    } satisfies AnteConfig;
  }

  async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string) {
    const baseDir =
      scope === "project"
        ? path.join(requireProjectRoot(projectRoot), ".ante", "skills")
        : path.join(this.homeDir(), "skills");
    return applyAgentSkills(skills, baseDir);
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

function requireProjectRoot(projectRoot?: string): string {
  if (!projectRoot) throw new Error("projectRoot required for project scope");
  return projectRoot;
}
