import type { IdeId, McpEntry, Scope } from "../../core/src/manifest.js";
import {
  mergeStandardMcpServers,
  readJsonFileOrDefault,
  writeJsonFileWithBackup,
} from "./mcp-utils";
import { getTargetCapabilities } from "./target-capabilities";
import type { IdeAdapter, IdeAdapterCapabilities } from "./types";

export interface McpConfigShape {
  mcpServers?: Record<string, unknown>;
}

export abstract class BaseAdapter implements IdeAdapter {
  abstract readonly id: IdeId;
  abstract readonly displayName: string;

  private _capabilities: IdeAdapterCapabilities | null = null;

  private get capabilities(): IdeAdapterCapabilities {
    if (!this._capabilities) {
      this._capabilities = getTargetCapabilities(this.id);
    }
    return this._capabilities;
  }

  get supportsMcp(): boolean {
    return this.capabilities.supportsMcp;
  }
  get supportsSkills(): boolean {
    return this.capabilities.supportsSkills;
  }
  get supportsRules(): boolean {
    return this.capabilities.supportsRules;
  }
  get supportedScopes(): readonly Scope[] {
    return this.capabilities.supportedScopes;
  }

  abstract configPath(scope: Scope, projectRoot?: string): string;

  async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    return readJsonFileOrDefault(this.configPath(scope, projectRoot), { mcpServers: {} });
  }

  applyMcps(
    config: unknown,
    mcps: McpEntry[],
    secrets: Record<string, string>,
    opts: { force: boolean },
  ): unknown {
    const current = (config as McpConfigShape) || { mcpServers: {} };
    return {
      ...current,
      mcpServers: mergeStandardMcpServers(
        (current.mcpServers || {}) as Record<
          string,
          { command?: string; args?: string[]; env?: Record<string, string>; url?: string }
        >,
        mcps,
        secrets,
        opts,
      ),
    };
  }

  async writeConfig(scope: Scope, config: unknown, projectRoot?: string): Promise<void> {
    await writeJsonFileWithBackup(this.configPath(scope, projectRoot), config);
  }

  async diff(scope: Scope, pending: unknown, _projectRoot?: string): Promise<string> {
    return JSON.stringify(pending, null, 2);
  }

  abstract postInstallHint(): string;
}
