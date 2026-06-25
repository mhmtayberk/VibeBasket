import os from "node:os";
import path from "node:path";
import type { Scope } from "../../core/src/manifest.js";
import { BaseAdapter } from "./base-adapter";

export class AntigravityAdapter extends BaseAdapter {
  readonly id = "antigravity" as const;
  readonly displayName = "Antigravity";

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".gemini", "antigravity", "mcp_config.json");
    }
    return path.join(os.homedir(), ".gemini", "antigravity", "mcp_config.json");
  }

  postInstallHint(): string {
    return "Restart Antigravity or reload the conversation for MCP changes to take effect.";
  }
}
