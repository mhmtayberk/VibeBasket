import os from "node:os";
import path from "node:path";
import type { Scope } from "@vibebasket/core";
import { BaseAdapter } from "./base-adapter";
export class GeminiCliAdapter extends BaseAdapter {
  readonly id = "gemini-cli" as const;
  readonly displayName = "Gemini CLI";
  configPath(scope: Scope, projectRoot?: string): string {
    if (scope === "project") {
      if (!projectRoot) throw new Error("projectRoot required for project scope");
      return path.join(projectRoot, ".gemini", "settings.json");
    }
    return path.join(os.homedir(), ".gemini", "settings.json");
  }
  postInstallHint(): string {
    return "Restart Gemini CLI for MCP server changes to take effect.";
  }
}
