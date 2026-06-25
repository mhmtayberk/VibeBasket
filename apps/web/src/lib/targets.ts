import {
  SUPPORTED_TARGET_IDS as ADAPTER_SUPPORTED_TARGET_IDS,
  TARGET_CAPABILITIES,
} from "@vibebasket/adapters/target-capabilities";
import type { IdeAdapterCapabilities } from "@vibebasket/adapters/types";
import type { IdeId, Scope } from "@vibebasket/core";

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
    note: "Backed by native Cursor MCP config plus documented skills and rules directories.",
    vendor: "Cursor",
  },
  {
    id: "windsurf",
    label: "Windsurf",
    status: "supported",
    kind: "editor",
    note: "Backed by Windsurf MCP config plus documented skills and rules surfaces.",
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
    note: "Backed by Zed context server settings plus documented .agents/skills directories.",
    vendor: "Zed Industries",
  },
  {
    id: "codex",
    label: "Codex CLI",
    status: "supported",
    kind: "terminal",
    note: "Backed by user and project Codex CLI config.toml MCP configuration.",
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
    note: "Backed by Gemini CLI settings.json MCP configuration plus .gemini/skills skill discovery.",
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
    note: "Backed by Kiro MCP configuration plus documented .kiro/skills directories.",
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
  {
    id: "continue",
    label: "Continue",
    status: "supported",
    kind: "editor",
    note: "Backed by ~/.continue/config.yaml MCP configuration and prompt references.",
    vendor: "Continue",
  },
  {
    id: "roocode",
    label: "Roo Code",
    status: "supported",
    kind: "editor",
    note: "Backed by .roo/mcp.json, Roo global mcp_settings.json, and documented .roo skills/rules surfaces.",
    vendor: "Roo Code",
  },
  {
    id: "hermes",
    label: "Hermes",
    status: "supported",
    kind: "terminal",
    note: "Backed by ~/.hermes/config.yaml MCP configuration and project-level .hermesrules rules.",
    vendor: "Hermes",
  },
  {
    id: "openclaw",
    label: "OpenClaw",
    status: "supported",
    kind: "terminal",
    note: "Backed by ~/.openclaw/openclaw.json MCP configuration and project-level .openclawrules rules.",
    vendor: "OpenClaw",
  },
  {
    id: "github-copilot",
    label: "GitHub Copilot",
    status: "supported",
    kind: "editor",
    note: "Idempotent project-level .github/copilot-instructions.md skills & rules supported.",
    vendor: "GitHub / Microsoft",
  },
  {
    id: "void",
    label: "Void Editor",
    status: "supported",
    kind: "editor",
    note: "Backed by the official user-scope ~/.void-editor/mcp.json MCP configuration today.",
    vendor: "Void",
  },
  {
    id: "aider",
    label: "Aider",
    status: "supported",
    kind: "terminal",
    note: "Idempotent project-level .aider.conf.yml and .aiderinstructions.md supported.",
    vendor: "Aider",
  },
  {
    id: "cortex-code",
    label: "Cortex Code",
    status: "supported",
    kind: "terminal",
    note: "Backed by ~/.snowflake/cortex/mcp.json and .cortex/skills/ directory.",
    vendor: "Snowflake",
  },
  {
    id: "goose",
    label: "Goose",
    status: "supported",
    kind: "terminal",
    note: "Backed by ~/.config/goose/config.yaml MCP extensions.",
    vendor: "Block / Linux Foundation",
  },
  {
    id: "ibm-bob",
    label: "IBM Bob",
    status: "supported",
    kind: "editor",
    note: "Backed by ~/.bob/mcp_settings.json and .bob/mcp.json project config.",
    vendor: "IBM",
  },
  {
    id: "codebuddy",
    label: "CodeBuddy",
    status: "supported",
    kind: "editor",
    note: "Backed by ~/.codebuddy/.mcp.json and .mcp.json project config.",
    vendor: "Tencent Cloud",
  },
  {
    id: "opencode",
    label: "OpenCode",
    status: "supported",
    kind: "terminal",
    note: "Backed by opencode.json / ~/.config/opencode/opencode.json plus .opencode skills and AGENTS.md rules.",
    vendor: "Anomaly",
  },
];

function deriveTargetStatus(id: IdeId): TargetStatus {
  return TARGET_CAPABILITIES[id].autoApply ? "supported" : "coming-soon";
}

export const TARGET_OPTIONS: TargetOption[] = UNSORTED_TARGET_OPTIONS.map((target) => ({
  ...target,
  status: deriveTargetStatus(target.id),
  capabilities: TARGET_CAPABILITIES[target.id],
})).sort((left, right) => left.label.localeCompare(right.label));

export const SUPPORTED_TARGET_IDS = [...ADAPTER_SUPPORTED_TARGET_IDS].sort((left, right) => {
  const leftLabel = TARGET_OPTIONS.find((target) => target.id === left)?.label ?? left;
  const rightLabel = TARGET_OPTIONS.find((target) => target.id === right)?.label ?? right;
  return leftLabel.localeCompare(rightLabel);
});

export const SUPPORTED_TARGET_COUNT = SUPPORTED_TARGET_IDS.length;

export const SKILLS_SUPPORTED_TARGET_COUNT = TARGET_OPTIONS.filter(
  (target) => target.status === "supported" && target.capabilities.supportsSkills,
).length;

export const RULES_SUPPORTED_TARGET_COUNT = TARGET_OPTIONS.filter(
  (target) => target.status === "supported" && target.capabilities.supportsRules,
).length;

export const DEFAULT_TARGET_IDS = ["claude-code"] as const;

const supportedTargetIdSet = new Set<IdeId>(SUPPORTED_TARGET_IDS);
const KNOWN_SCOPES: Scope[] = ["user", "project"];

export function isSupportedTargetId(targetId: string): targetId is IdeId {
  return supportedTargetIdSet.has(targetId as IdeId);
}

export function getSharedTargetScopes(targetIds: IdeId[]): Scope[] {
  if (targetIds.length === 0) {
    return [];
  }

  return KNOWN_SCOPES.filter((scope) =>
    targetIds.every((targetId) => TARGET_CAPABILITIES[targetId].supportedScopes.includes(scope)),
  );
}

export function resolvePreferredBundleScope(targetIds: IdeId[]): Scope | null {
  const sharedScopes = getSharedTargetScopes(targetIds);

  if (sharedScopes.includes("user")) {
    return "user";
  }

  if (sharedScopes.includes("project")) {
    return "project";
  }

  return null;
}
