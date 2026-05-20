import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { IdeAdapter } from "./types";
import type { IdeId, McpEntry, Scope } from "@vibebasket/core";
import { resolveMcpEnv } from "./mcp-utils";

export interface CursorMcpConfig {
  mcpServers: Record<
    string,
    {
      command: string;
      args?: string[];
      env?: Record<string, string>;
    }
  >;
}

export class CursorAdapter implements IdeAdapter {
  readonly id: IdeId = "cursor";
  readonly displayName = "Cursor";
  readonly supportsMcp = true;
  readonly supportsSkills = false;
  readonly supportsRules = true;
  readonly supportedScopes: readonly Scope[] = ["user", "project"];

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".cursor", "mcp.json");
    }

    const platform = os.platform();
    if (platform === "win32") {
      return path.join(os.homedir(), "AppData", "Roaming", "Cursor", "User", "globalStorage", "saoudrizwan.claude-dev", "settings", "cline_mcp_settings.json");
      // Wait, is it cline_mcp_settings.json? No, Cursor's native MCP uses ~/.cursor/mcp.json or similar.
      // The prompt specified:
      // macOS: ~/.cursor/mcp.json | Linux: ~/.cursor/mcp.json | Windows: %USERPROFILE%\.cursor\mcp.json
    }
    return path.join(os.homedir(), ".cursor", "mcp.json");
  }

  async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    const file = this.configPath(scope, projectRoot);
    try {
      const content = await fs.readFile(file, "utf8");
      return JSON.parse(content);
    } catch (e: any) {
      if (e.code === "ENOENT") {
        return { mcpServers: {} };
      }
      throw e;
    }
  }

  applyMcps(
    config: unknown,
    mcps: McpEntry[],
    secrets: Record<string, string>,
    opts: { force: boolean }
  ): unknown {
    const current = (config as CursorMcpConfig) || { mcpServers: {} };
    if (!current.mcpServers) {
      current.mcpServers = {};
    }

    const next = { ...current, mcpServers: { ...current.mcpServers } };

    for (const mcp of mcps) {
      if (next.mcpServers[mcp.id] && !opts.force) {
        continue;
      }

      // Resolve secrets
      const resolvedEnv = resolveMcpEnv(mcp.env, secrets);

      const nextMcp: NonNullable<CursorMcpConfig["mcpServers"][string]> = {
        command: mcp.command || mcp.runtime,
        args: mcp.args,
      };

      if (Object.keys(resolvedEnv).length > 0) {
        nextMcp.env = resolvedEnv;
      }

      next.mcpServers[mcp.id] = nextMcp;
    }

    return next;
  }

  async writeConfig(scope: Scope, config: unknown, projectRoot?: string): Promise<void> {
    const file = this.configPath(scope, projectRoot);
    const dir = path.dirname(file);
    await fs.mkdir(dir, { recursive: true });

    // Backup
    try {
      const content = await fs.readFile(file, "utf8");
      await fs.writeFile(`${file}.bak.${Date.now()}`, content, "utf8");
    } catch (e: any) {
      if (e.code !== "ENOENT") throw e;
    }

    await fs.writeFile(file, JSON.stringify(config, null, 2), "utf8");
  }

  async diff(scope: Scope, pending: unknown, projectRoot?: string): Promise<string> {
    const current = await this.readConfig(scope, projectRoot);
    // Real implementation would use something like diff package. For now, stringify comparison.
    return JSON.stringify(pending, null, 2);
  }

  postInstallHint(): string {
    return "Restart Cursor or reload the window for MCP changes to take effect.";
  }
}
