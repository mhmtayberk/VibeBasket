import os from "node:os";
import path from "node:path";
import type { Scope } from "@vibebasket/core";
import { BaseAdapter } from "./base-adapter";

export class OpenCodeAdapter extends BaseAdapter {
	readonly id = "opencode" as const;
	readonly displayName = "OpenCode";

	configPath(scope: Scope, projectRoot?: string): string {
		if (scope === "project" && projectRoot) {
			return path.join(projectRoot, "opencode.json");
		}
		return path.join(os.homedir(), ".config", "opencode", "opencode.json");
	}

	postInstallHint(): string {
		return "Restart OpenCode or reload the TUI for MCP changes to take effect.";
	}
}
