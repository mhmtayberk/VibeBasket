import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { RuleEntry, Scope } from "@vibebasket/core";
import { BaseAdapter } from "./base-adapter";

export class CursorAdapter extends BaseAdapter {
	readonly id = "cursor" as const;
	readonly displayName = "Cursor";

	configPath(scope: Scope, projectRoot?: string): string {
		if (scope === "project") {
			if (!projectRoot) throw new Error("projectRoot required for project scope");
			return path.join(projectRoot, ".cursor", "mcp.json");
		}
		return path.join(os.homedir(), ".cursor", "mcp.json");
	}

	async applyRules(rules: RuleEntry[], scope: Scope, projectRoot?: string): Promise<void> {
		const baseDir = scope === "project" && projectRoot
			? path.join(projectRoot, ".cursor", "rules")
			: path.join(os.homedir(), ".cursor", "rules");
		await fs.mkdir(baseDir, { recursive: true });
		for (const rule of rules) {
			await fs.writeFile(path.join(baseDir, `${rule.id}.md`), `# ${rule.displayName}\n\n${rule.content}`, "utf8");
		}
	}

	postInstallHint(): string {
		return "Restart Cursor or reload the window for MCP changes to take effect.";
	}
}
