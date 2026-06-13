import os from "node:os";
import path from "node:path";
import type { Scope } from "@vibebasket/core";
import { BaseAdapter } from "./base-adapter";

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
				os.homedir(),
				"Library",
				"Application Support",
				"Code",
				"User",
				"globalStorage",
				"saoudrizwan.claude-dev",
				"settings",
				"cline_mcp_settings.json",
			);
		}
		if (platform === "win32") {
			return path.join(
				os.homedir(),
				"AppData",
				"Roaming",
				"Code",
				"User",
				"globalStorage",
				"saoudrizwan.claude-dev",
				"settings",
				"cline_mcp_settings.json",
			);
		}
		return path.join(
			os.homedir(),
			".config",
			"Code",
			"User",
			"globalStorage",
			"saoudrizwan.claude-dev",
			"settings",
			"cline_mcp_settings.json",
		);
	}

	postInstallHint(): string {
		return "Restart VS Code or reload the window for Cline MCP changes to take effect.";
	}
}
