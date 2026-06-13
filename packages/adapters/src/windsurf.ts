import os from "node:os";
import path from "node:path";
import type { Scope } from "@vibebasket/core";
import { BaseAdapter } from "./base-adapter";

export class WindsurfAdapter extends BaseAdapter {
	readonly id = "windsurf" as const;
	readonly displayName = "Windsurf";

	configPath(scope: Scope, projectRoot?: string): string {
		if (scope === "project") {
			if (!projectRoot) {
				throw new Error("projectRoot required for project scope");
			}
			return path.join(projectRoot, ".windsurf", "mcp_config.json");
		}
		return path.join(os.homedir(), ".codeium", "windsurf", "mcp_config.json");
	}

	postInstallHint(): string {
		return "Restart Windsurf or reload the window for MCP changes to take effect.";
	}
}
