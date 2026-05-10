import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { IdeAdapter } from "./types";
import type { IdeId, McpEntry, Scope } from "@vibebasket/core";

export interface WindsurfMcpConfig {
  mcpServers: Record<
    string,
    {
      command: string;
      args?: string[];
      env?: Record<string, string>;
    }
  >;
}

export class WindsurfAdapter implements IdeAdapter {
  readonly id: IdeId = "windsurf";
  readonly displayName = "Windsurf";
  readonly supportsMcp = true;
  readonly supportsSkills = false;
  readonly supportsRules = true;
  readonly supportedScopes: readonly Scope[] = ["user", "project"];

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".windsurf", "mcp_config.json");
    }

    return path.join(os.homedir(), ".codeium", "windsurf", "mcp_config.json");
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
    const current = (config as WindsurfMcpConfig) || { mcpServers: {} };
    if (!current.mcpServers) {
      current.mcpServers = {};
    }

    const next = { ...current, mcpServers: { ...current.mcpServers } };

    for (const mcp of mcps) {
      if (next.mcpServers[mcp.id] && !opts.force) {
        continue;
      }

      const resolvedEnv: Record<string, string> = {};
      for (const [k, v] of Object.entries(mcp.env)) {
        let val = v;
        for (const [secName, secVal] of Object.entries(secrets)) {
          val = val.replace(`\${secret:${secName}}`, secVal);
        }
        resolvedEnv[k] = val;
      }

      const nextMcp: NonNullable<WindsurfMcpConfig["mcpServers"][string]> = {
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
    return JSON.stringify(pending, null, 2);
  }

  postInstallHint(): string {
    return "Restart Windsurf or reload the window for MCP changes to take effect.";
  }
}
