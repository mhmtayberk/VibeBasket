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

interface ClineCliMcpConfig {
  mcpServers: Record<string, BasicMcpServerConfig>;
}

export class ClineCliAdapter implements IdeAdapter {
  private static readonly capabilities = getTargetCapabilities("cline-cli");
  readonly id: IdeId = "cline-cli";
  readonly displayName = "Cline CLI";
  readonly supportsMcp = ClineCliAdapter.capabilities.supportsMcp;
  readonly supportsSkills = ClineCliAdapter.capabilities.supportsSkills;
  readonly supportsRules = ClineCliAdapter.capabilities.supportsRules;
  readonly supportedScopes: readonly Scope[] = ClineCliAdapter.capabilities.supportedScopes;

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      throw new Error("Cline CLI only supports user scope in VibeBasket today");
    }

    return path.join(os.homedir(), ".cline", "data", "settings", "cline_mcp_settings.json");
  }

  async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    return readJsonFileOrDefault<ClineCliMcpConfig>(
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
    const current = (config as ClineCliMcpConfig) || { mcpServers: {} };
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
    return "Restart Cline CLI or open a new session so the MCP config is reloaded.";
  }
}
