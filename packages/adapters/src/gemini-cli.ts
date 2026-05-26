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

interface GeminiCliConfig {
  mcpServers: Record<string, BasicMcpServerConfig>;
}

export class GeminiCliAdapter implements IdeAdapter {
  private static readonly capabilities = getTargetCapabilities("gemini-cli");
  readonly id: IdeId = "gemini-cli";
  readonly displayName = "Gemini CLI";
  readonly supportsMcp = GeminiCliAdapter.capabilities.supportsMcp;
  readonly supportsSkills = GeminiCliAdapter.capabilities.supportsSkills;
  readonly supportsRules = GeminiCliAdapter.capabilities.supportsRules;
  readonly supportedScopes: readonly Scope[] = GeminiCliAdapter.capabilities.supportedScopes;

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".gemini", "settings.json");
    }

    return path.join(os.homedir(), ".gemini", "settings.json");
  }

  async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    return readJsonFileOrDefault<GeminiCliConfig>(
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
    const current = (config as GeminiCliConfig) || { mcpServers: {} };
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
    return "Restart Gemini CLI or start a new session to reload MCP servers.";
  }
}
