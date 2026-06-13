import os from "node:os";
import path from "node:path";
import type { McpEntry, Scope } from "@vibebasket/core";
import { BaseAdapter } from "./base-adapter";
import { mergeStandardMcpServers } from "./mcp-utils";

interface ZedConfig {
  context_servers?: Record<
    string,
    {
      command?: string;
      args?: string[];
      env?: Record<string, string>;
      url?: string;
      type?: string;
    }
  >;
}

export class ZedAdapter extends BaseAdapter {
  readonly id = "zed" as const;
  readonly displayName = "Zed";

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".zed", "settings.json");
    }
    const platform = os.platform();
    if (platform === "darwin") return path.join(os.homedir(), ".config", "zed", "settings.json");
    if (platform === "win32")
      return path.join(os.homedir(), "AppData", "Roaming", "Zed", "settings.json");
    return path.join(os.homedir(), ".config", "zed", "settings.json");
  }

  override applyMcps(
    config: unknown,
    mcps: McpEntry[],
    secrets: Record<string, string>,
    opts: { force: boolean },
  ): unknown {
    const current = (config as ZedConfig) || { context_servers: {} };
    return {
      ...current,
      context_servers: mergeStandardMcpServers(current.context_servers || {}, mcps, secrets, opts),
    };
  }

  postInstallHint(): string {
    return "Restart Zed for context server changes to take effect.";
  }
}
