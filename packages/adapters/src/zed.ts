import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { IdeAdapter } from "./types";
import type { IdeId, McpEntry, Scope } from "@vibebasket/core";
import { resolveMcpEnv } from "./mcp-utils";

interface ZedContextServerConfig {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
}

interface ZedSettingsConfig {
  context_servers?: Record<string, ZedContextServerConfig>;
}

export class ZedAdapter implements IdeAdapter {
  readonly id: IdeId = "zed";
  readonly displayName = "Zed";
  readonly supportsMcp = true;
  readonly supportsSkills = false;
  readonly supportsRules = true;
  readonly supportedScopes: readonly Scope[] = ["user", "project"];

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".zed", "settings.json");
    }

    if (os.platform() === "darwin") {
      return path.join(os.homedir(), ".config", "zed", "settings.json");
    }

    return path.join(
      process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"),
      "zed",
      "settings.json"
    );
  }

  async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    const file = this.configPath(scope, projectRoot);
    try {
      const content = await fs.readFile(file, "utf8");
      return JSON.parse(content) as ZedSettingsConfig;
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return { context_servers: {} };
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
    const current = (config as ZedSettingsConfig) || { context_servers: {} };
    const next = {
      ...current,
      context_servers: { ...(current.context_servers || {}) },
    };

    for (const mcp of mcps) {
      if (next.context_servers[mcp.id] && !opts.force) {
        continue;
      }

      if (mcp.runtime === "remote") {
        next.context_servers[mcp.id] = {
          ...(mcp.url ? { url: mcp.url } : {}),
        };
        continue;
      }

      const env = resolveMcpEnv(mcp.env, secrets);
      next.context_servers[mcp.id] = {
        command: mcp.command || mcp.runtime,
        args: mcp.args,
        ...(Object.keys(env).length > 0 ? { env } : {}),
      };
    }

    return next;
  }

  async writeConfig(scope: Scope, config: unknown, projectRoot?: string): Promise<void> {
    const file = this.configPath(scope, projectRoot);
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

  async diff(scope: Scope, pending: unknown): Promise<string> {
    return JSON.stringify(pending, null, 2);
  }

  postInstallHint(): string {
    return "Restart Zed or reopen the Agent settings panel to pick up new context servers.";
  }
}
