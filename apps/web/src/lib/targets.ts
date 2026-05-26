import {
	SUPPORTED_TARGET_IDS as ADAPTER_SUPPORTED_TARGET_IDS,
	TARGET_CAPABILITIES,
} from "@vibebasket/adapters/target-capabilities";
import type { IdeAdapterCapabilities } from "@vibebasket/adapters/types";
import type { IdeId } from "@vibebasket/core";

export type TargetStatus = "supported" | "coming-soon";

export interface TargetOption {
	id: IdeId;
	label: string;
	status: TargetStatus;
	kind: "editor" | "terminal";
	note: string;
	vendor?: string;
	capabilities: IdeAdapterCapabilities;
}

interface TargetOptionSeed {
	id: IdeId;
	label: string;
	status?: TargetStatus;
	kind: "editor" | "terminal";
	note: string;
	vendor?: string;
}

const UNSORTED_TARGET_OPTIONS: TargetOptionSeed[] = [
	{
		id: "cursor",
		label: "Cursor",
		status: "supported",
		kind: "editor",
		note: "Native MCP config supported today.",
		vendor: "Cursor",
	},
	{
		id: "windsurf",
		label: "Windsurf",
		status: "supported",
		kind: "editor",
		note: "Native MCP config supported today.",
		vendor: "Windsurf",
	},
	{
		id: "vscode",
		label: "VS Code / Cline",
		status: "supported",
		kind: "editor",
		note: "Targets the local Cline MCP settings file.",
		vendor: "Microsoft / Cline",
	},
	{
		id: "antigravity",
		label: "Antigravity",
		status: "supported",
		kind: "editor",
		note: "Applies through the Gemini Antigravity config path.",
		vendor: "Google",
	},
	{
		id: "claude-code",
		label: "Claude Code",
		status: "supported",
		kind: "terminal",
		note: "Backed by Claude Code MCP configuration files.",
		vendor: "Anthropic",
	},
	{
		id: "zed",
		label: "Zed",
		status: "supported",
		kind: "editor",
		note: "Backed by Zed context server settings.",
		vendor: "Zed Industries",
	},
	{
		id: "codex",
		label: "Codex CLI",
		status: "supported",
		kind: "terminal",
		note: "Backed by Codex CLI config.toml MCP configuration.",
		vendor: "OpenAI",
	},
	{
		id: "deepseek-tui",
		label: "DeepSeek-TUI",
		status: "supported",
		kind: "terminal",
		note: "Backed by ~/.deepseek/mcp.json today; auto-apply currently covers MCP config only.",
		vendor: "DeepSeek-TUI",
	},
	{
		id: "gemini-cli",
		label: "Gemini CLI",
		status: "supported",
		kind: "terminal",
		note: "Backed by Gemini CLI settings.json MCP configuration.",
		vendor: "Google",
	},
	{
		id: "junie",
		label: "JetBrains Junie",
		status: "supported",
		kind: "editor",
		note: "Backed by Junie MCP configuration files.",
		vendor: "JetBrains",
	},
	{
		id: "kiro",
		label: "Kiro",
		status: "supported",
		kind: "editor",
		note: "Backed by Kiro MCP configuration files.",
		vendor: "Kiro",
	},
	{
		id: "cline-cli",
		label: "Cline CLI",
		status: "supported",
		kind: "terminal",
		note: "Backed by the Cline CLI MCP settings file.",
		vendor: "Cline",
	},
];

function deriveTargetStatus(id: IdeId): TargetStatus {
	return TARGET_CAPABILITIES[id].autoApply ? "supported" : "coming-soon";
}

export const TARGET_OPTIONS: TargetOption[] = UNSORTED_TARGET_OPTIONS.map(
	(target) => ({
		...target,
		status: deriveTargetStatus(target.id),
		capabilities: TARGET_CAPABILITIES[target.id],
	}),
).sort((left, right) => left.label.localeCompare(right.label));

export const SUPPORTED_TARGET_IDS = [...ADAPTER_SUPPORTED_TARGET_IDS].sort(
	(left, right) => {
		const leftLabel =
			TARGET_OPTIONS.find((target) => target.id === left)?.label ?? left;
		const rightLabel =
			TARGET_OPTIONS.find((target) => target.id === right)?.label ?? right;
		return leftLabel.localeCompare(rightLabel);
	},
);

export const DEFAULT_TARGET_IDS = ["claude-code"] as const;

const supportedTargetIdSet = new Set<IdeId>(SUPPORTED_TARGET_IDS);

export function isSupportedTargetId(targetId: string): targetId is IdeId {
	return supportedTargetIdSet.has(targetId as IdeId);
}
