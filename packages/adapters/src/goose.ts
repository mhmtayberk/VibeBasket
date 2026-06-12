import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { IdeAdapter } from "./types";
import type { IdeId, McpEntry, Scope } from "@vibebasket/core";
import { mergeStandardMcpServers, readJsonFileOrDefault, writeJsonFileWithBackup } from "./mcp-utils";
import { getTargetCapabilities } from "./target-capabilities";

export class GooseAdapter implements IdeAdapter {
	private static readonly capabilities = getTargetCapabilities("goose");
	readonly id: IdeId = "goose";
	readonly displayName = "Goose";
	readonly supportsMcp = GooseAdapter.capabilities.supportsMcp;
	readonly supportsSkills = GooseAdapter.capabilities.supportsSkills;
	readonly supportsRules = GooseAdapter.capabilities.supportsRules;
	readonly supportedScopes = GooseAdapter.capabilities.supportedScopes as readonly Scope[];

	configPath(_scope: Scope, _projectRoot?: string): string {
		return path.join(os.homedir(), ".config", "goose", "config.yaml");
	}

	async readConfig(_scope: Scope, _projectRoot?: string) {
		return readJsonFileOrDefault(this.configPath("user"), { mcpServers: {} });
	}

	applyMcps(config: unknown, mcps: McpEntry[], secrets: Record<string, string>, opts: { force: boolean }) {
		const current = (config as { mcpServers?: Record<string, unknown> }) || { mcpServers: {} };
		return { ...current, mcpServers: mergeStandardMcpServers((current.mcpServers || {}) as Record<string, { command?: string; args?: string[]; env?: Record<string, string>; url?: string }>, mcps, secrets, opts) };
	}

	async writeConfig(scope: Scope, config: unknown, projectRoot?: string) {
		await writeJsonFileWithBackup(this.configPath(scope, projectRoot), config);
	}

	async diff(scope: Scope, pending: unknown, projectRoot?: string) {
		return JSON.stringify(pending, null, 2);
	}

	postInstallHint(): string {
		return "Restart Goose or reload the session for MCP changes to take effect.";
	}
}
