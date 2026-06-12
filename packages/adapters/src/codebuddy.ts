import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { IdeAdapter } from "./types";
import type { IdeId, McpEntry, Scope, SkillEntry } from "@vibebasket/core";
import { mergeStandardMcpServers, readJsonFileOrDefault, writeJsonFileWithBackup } from "./mcp-utils";
import { getTargetCapabilities } from "./target-capabilities";

export class CodeBuddyAdapter implements IdeAdapter {
	private static readonly capabilities = getTargetCapabilities("codebuddy");
	readonly id: IdeId = "codebuddy";
	readonly displayName = "CodeBuddy";
	readonly supportsMcp = CodeBuddyAdapter.capabilities.supportsMcp;
	readonly supportsSkills = CodeBuddyAdapter.capabilities.supportsSkills;
	readonly supportsRules = CodeBuddyAdapter.capabilities.supportsRules;
	readonly supportedScopes = CodeBuddyAdapter.capabilities.supportedScopes as readonly Scope[];

	configPath(scope: Scope, projectRoot?: string): string {
		if (scope === "project" && projectRoot) {
			return path.join(projectRoot, ".mcp.json");
		}
		return path.join(os.homedir(), ".codebuddy", ".mcp.json");
	}

	async readConfig(scope: Scope, projectRoot?: string) {
		return readJsonFileOrDefault(this.configPath(scope, projectRoot), { mcpServers: {} });
	}

	applyMcps(config: unknown, mcps: McpEntry[], secrets: Record<string, string>, opts: { force: boolean }) {
		const current = (config as { mcpServers?: Record<string, unknown> }) || { mcpServers: {} };
		return { ...current, mcpServers: mergeStandardMcpServers((current.mcpServers || {}) as Record<string, { command?: string; args?: string[]; env?: Record<string, string>; url?: string }>, mcps, secrets, opts) };
	}

	async applySkills(skills: SkillEntry[], scope: Scope, projectRoot?: string) {
		const skillsDir = scope === "project" && projectRoot
			? path.join(projectRoot, ".codebuddy", "skills")
			: path.join(os.homedir(), ".codebuddy", "skills");
		await fs.mkdir(skillsDir, { recursive: true });
		for (const skill of skills) {
			const content = skill.source.type === "inline" ? skill.source.content : `# ${skill.displayName}\nSource: ${skill.source.type === "github" ? `github.com/${skill.source.repo}` : skill.source.type === "npm" ? skill.source.package : "inline"}`;
			await fs.writeFile(path.join(skillsDir, `${skill.id}.md`), `# ${skill.displayName}\n\n${content}`, "utf8");
		}
	}

	async writeConfig(scope: Scope, config: unknown, projectRoot?: string) {
		await writeJsonFileWithBackup(this.configPath(scope, projectRoot), config);
	}

	async diff(scope: Scope, pending: unknown, projectRoot?: string) {
		return JSON.stringify(pending, null, 2);
	}

	postInstallHint(): string {
		return "Restart CodeBuddy or reload the window for MCP changes to take effect.";
	}
}
