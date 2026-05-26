import os from "node:os";
import path from "node:path";
import type { IdeAdapter } from "./types";
import type { IdeId, McpEntry, Scope } from "@vibebasket/core";
import {
	mergeStandardMcpServers,
	readJsonFileOrDefault,
	writeJsonFileWithBackup,
	type BasicMcpServerConfig,
} from "./mcp-utils";
import { getTargetCapabilities } from "./target-capabilities";

interface DeepSeekTuiMcpConfig {
	mcpServers: Record<string, BasicMcpServerConfig>;
}

export class DeepSeekTuiAdapter implements IdeAdapter {
	private static readonly capabilities = getTargetCapabilities("deepseek-tui");
	readonly id: IdeId = "deepseek-tui";
	readonly displayName = "DeepSeek-TUI";
	readonly supportsMcp = DeepSeekTuiAdapter.capabilities.supportsMcp;
	readonly supportsSkills = DeepSeekTuiAdapter.capabilities.supportsSkills;
	readonly supportsRules = DeepSeekTuiAdapter.capabilities.supportsRules;
	readonly supportedScopes: readonly Scope[] =
		DeepSeekTuiAdapter.capabilities.supportedScopes;

	configPath(scope: Scope): string {
		if (scope === "project") {
			throw new Error("DeepSeek-TUI currently reads MCP config from user scope only");
		}

		return path.join(os.homedir(), ".deepseek", "mcp.json");
	}

	async readConfig(scope: Scope): Promise<unknown> {
		return readJsonFileOrDefault<DeepSeekTuiMcpConfig>(this.configPath(scope), {
			mcpServers: {},
		});
	}

	applyMcps(
		config: unknown,
		mcps: McpEntry[],
		secrets: Record<string, string>,
		opts: { force: boolean },
	): unknown {
		const current = (config as DeepSeekTuiMcpConfig) || { mcpServers: {} };

		return {
			...current,
			mcpServers: mergeStandardMcpServers(
				current.mcpServers,
				mcps,
				secrets,
				opts,
			),
		};
	}

	async writeConfig(scope: Scope, config: unknown): Promise<void> {
		await writeJsonFileWithBackup(this.configPath(scope), config);
	}

	async diff(scope: Scope, pending: unknown): Promise<string> {
		return JSON.stringify(pending, null, 2);
	}

	postInstallHint(): string {
		return "Restart DeepSeek-TUI or start a fresh session so updated MCP servers are loaded.";
	}
}
