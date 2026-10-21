import os from "node:os";
import path from "node:path";
import type { Scope } from "../../core/src/manifest.js";
import { BaseAdapter } from "./base-adapter";

export class QoderAdapter extends BaseAdapter {
  readonly id = "qoder" as const;
  readonly displayName = "Qoder";

  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".mcp.json");
    }
    const configDir = process.env.QODER_CONFIG_DIR?.trim() || path.join(os.homedir(), ".qoder");
    return path.join(configDir, "settings.json");
  }

  postInstallHint(): string {
    return "Run /mcp reload in Qoder CLI or start a new session.";
  }
}
