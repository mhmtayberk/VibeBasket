import path from "node:path";
import type { Scope } from "../../core/src/manifest.js";
import { BaseAdapter } from "./base-adapter";

export class TraeAdapter extends BaseAdapter {
  readonly id = "trae" as const;
  readonly displayName = "Trae";

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope !== "project") throw new Error("Trae only supports project scope auto-apply.");
    if (!projectRoot) throw new Error("projectRoot required for project scope");
    return path.join(projectRoot, ".trae", "mcp.json");
  }

  postInstallHint(): string {
    return "Enable project-level MCP in Trae, then reload the workspace.";
  }
}
