export type TargetStatus = "supported" | "coming-soon";

export interface TargetOption {
  id: string;
  label: string;
  status: TargetStatus;
  kind: "editor" | "terminal";
  note: string;
  vendor?: string;
}

const UNSORTED_TARGET_OPTIONS: TargetOption[] = [
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

export const TARGET_OPTIONS: TargetOption[] = [...UNSORTED_TARGET_OPTIONS].sort((left, right) =>
  left.label.localeCompare(right.label)
);

export const SUPPORTED_TARGET_IDS = TARGET_OPTIONS
  .filter((target) => target.status === "supported")
  .map((target) => target.id);

export const DEFAULT_TARGET_IDS = ["claude-code"] as const;
