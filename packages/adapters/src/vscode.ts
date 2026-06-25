import os from "node:os";
import path from "node:path";
import type { Scope } from "../../core/src/manifest.js";
import { BaseAdapter } from "./base-adapter";
import { getVsCodeGlobalStorageDir } from "./platform-paths";

export class VSCodeAdapter extends BaseAdapter {
  readonly id = "vscode" as const;
  readonly displayName = "VS Code / Cline";

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) {
        throw new Error("projectRoot required for project scope");
      }
      return path.join(projectRoot, ".vscode", "cline_mcp_settings.json");
    }

    const platform = os.platform();
    if (platform === "darwin") {
      return path.join(
        getVsCodeGlobalStorageDir("saoudrizwan.claude-dev"),
        "cline_mcp_settings.json",
      );
    }
    if (platform === "win32") {
      return path.join(
        getVsCodeGlobalStorageDir("saoudrizwan.claude-dev"),
        "cline_mcp_settings.json",
      );
    }
    return path.join(
      getVsCodeGlobalStorageDir("saoudrizwan.claude-dev"),
      "cline_mcp_settings.json",
    );
  }

  postInstallHint(): string {
    return "Restart VS Code or reload the window for Cline MCP changes to take effect.";
  }
}
