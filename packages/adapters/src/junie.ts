import os from "node:os";
import path from "node:path";
import type { IdeAdapter } from "./types";
import type { IdeId, McpEntry, Scope } from "@vibebasket/core";
import {
  mergeStandardMcpServers,
  readJsonFileOrDefault,
  writeJsonFileWithBackup,
  type BasicMcpServerConfig,
} from "./mcp-utils";

interface JunieMcpConfig {
  mcpServers: Record<string, BasicMcpServerConfig>;
}

export class JunieAdapter implements IdeAdapter {
  readonly id: IdeId = "junie";
  readonly displayName = "JetBrains Junie";
  readonly supportsMcp = true;
  readonly supportsSkills = false;
  readonly supportsRules = true;
  readonly supportedScopes: readonly Scope[] = ["user", "project"];

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".junie", "mcp", "mcp.json");
    }

    return path.join(os.homedir(), ".junie", "mcp", "mcp.json");
  }

  async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    return readJsonFileOrDefault<JunieMcpConfig>(
      this.configPath(scope, projectRoot),
      { mcpServers: {} }
    );
  }

  applyMcps(
    config: unknown,
    mcps: McpEntry[],
    secrets: Record<string, string>,
    opts: { force: boolean }
  ): unknown {
    const current = (config as JunieMcpConfig) || { mcpServers: {} };
    return {
      ...current,
      mcpServers: mergeStandardMcpServers(current.mcpServers, mcps, secrets, opts),
    };
  }

  async writeConfig(scope: Scope, config: unknown, projectRoot?: string): Promise<void> {
    await writeJsonFileWithBackup(this.configPath(scope, projectRoot), config);
  }

  async diff(scope: Scope, pending: unknown): Promise<string> {
    return JSON.stringify(pending, null, 2);
  }

  postInstallHint(): string {
    return "Restart Junie CLI or reopen the MCP configuration screen to verify activation.";
  }
}
