import os from "node:os";
import path from "node:path";
import type { Scope } from "@vibebasket/core";
import { BaseAdapter } from "./base-adapter";
export class KiroAdapter extends BaseAdapter {
  readonly id = "kiro" as const;
  readonly displayName = "Kiro";
  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".kiro", "settings", "mcp.json");
    }
    return path.join(os.homedir(), ".kiro", "settings", "mcp.json");
  }
  postInstallHint(): string {
    return "Restart Kiro or reload MCP settings before the next task.";
  }
}
