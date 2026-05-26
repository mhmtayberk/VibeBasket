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
import { getTargetCapabilities } from "./target-capabilities";

interface KiroMcpConfig {
  mcpServers: Record<string, BasicMcpServerConfig>;
}

export class KiroAdapter implements IdeAdapter {
  private static readonly capabilities = getTargetCapabilities("kiro");
  readonly id: IdeId = "kiro";
  readonly displayName = "Kiro";
  readonly supportsMcp = KiroAdapter.capabilities.supportsMcp;
  readonly supportsSkills = KiroAdapter.capabilities.supportsSkills;
  readonly supportsRules = KiroAdapter.capabilities.supportsRules;
  readonly supportedScopes: readonly Scope[] = KiroAdapter.capabilities.supportedScopes;

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".kiro", "settings", "mcp.json");
    }

    return path.join(os.homedir(), ".kiro", "settings", "mcp.json");
  }

  async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    return readJsonFileOrDefault<KiroMcpConfig>(
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
    const current = (config as KiroMcpConfig) || { mcpServers: {} };
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
    return "Restart Kiro or reload MCP settings before the next task.";
  }
}
