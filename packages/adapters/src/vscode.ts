import path from "node:path";
import type { McpEntry, Scope } from "../../core/src/manifest.js";
import { BaseAdapter } from "./base-adapter";
import { mergeStandardMcpServers } from "./mcp-utils";
import { getVsCodeUserDir } from "./platform-paths";

interface VsCodeConfig {
  servers?: Record<string, unknown>;
  [key: string]: unknown;
}

export class VSCodeAdapter extends BaseAdapter {
  readonly id = "vscode" as const;
  readonly displayName = "Visual Studio Code";

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) {
        throw new Error("projectRoot required for project scope");
      }
      return path.join(projectRoot, ".vscode", "mcp.json");
    }
    return path.join(getVsCodeUserDir(), "mcp.json");
  }

  override async readConfig(scope: Scope, projectRoot?: string): Promise<unknown> {
    const current = (await super.readConfig(scope, projectRoot)) as Record<string, unknown>;
    return {
      ...current,
      servers: (current.servers as Record<string, unknown> | undefined) || {},
    } satisfies VsCodeConfig;
  }

  override applyMcps(
    config: unknown,
    mcps: McpEntry[],
    secrets: Record<string, string>,
    opts: { force: boolean },
  ): unknown {
    const current = (config as VsCodeConfig) || { servers: {} };
    const merged = mergeStandardMcpServers(
      current.servers as Parameters<typeof mergeStandardMcpServers>[0],
      mcps,
      secrets,
      opts,
    );
    return {
      ...current,
      servers: Object.fromEntries(
        Object.entries(merged).map(([id, server]) => [
          id,
          server.url ? server : { type: "stdio", ...server },
        ]),
      ),
    } satisfies VsCodeConfig;
  }

  postInstallHint(): string {
    return "Run MCP: List Servers in VS Code and verify the server is active.";
  }
}
