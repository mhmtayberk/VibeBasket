export type TargetStatus = "supported" | "coming-soon";

export interface TargetOption {
  id: string;
  label: string;
  status: TargetStatus;
  kind: "editor" | "terminal";
  shortLabel: string;
  note: string;
  vendor?: string;
}

export const TARGET_OPTIONS: TargetOption[] = [
  {
    id: "cursor",
    label: "Cursor",
    shortLabel: "CU",
    status: "supported",
    kind: "editor",
    note: "Native MCP config supported today.",
    vendor: "Cursor",
  },
  {
    id: "windsurf",
    label: "Windsurf",
    shortLabel: "WS",
    status: "supported",
    kind: "editor",
    note: "Native MCP config supported today.",
    vendor: "Windsurf",
  },
  {
    id: "vscode",
    label: "VS Code / Cline",
    shortLabel: "VC",
    status: "supported",
    kind: "editor",
    note: "Targets the local Cline MCP settings file.",
    vendor: "Microsoft / Cline",
  },
  {
    id: "antigravity",
    label: "Antigravity",
    shortLabel: "AG",
    status: "supported",
    kind: "editor",
    note: "Applies through the Gemini Antigravity config path.",
    vendor: "Google",
  },
  {
    id: "claude-code",
    label: "Claude Code",
    shortLabel: "CC",
    status: "supported",
    kind: "terminal",
    note: "Backed by Claude Code MCP configuration files.",
    vendor: "Anthropic",
  },
  {
    id: "zed",
    label: "Zed",
    shortLabel: "ZD",
    status: "supported",
    kind: "editor",
    note: "Backed by Zed context server settings.",
    vendor: "Zed Industries",
  },
  {
    id: "codex",
    label: "Codex CLI",
    shortLabel: "CX",
    status: "supported",
    kind: "terminal",
    note: "Backed by Codex CLI config.toml MCP configuration.",
    vendor: "OpenAI",
  },
  {
    id: "gemini-cli",
    label: "Gemini CLI",
    shortLabel: "GC",
    status: "supported",
    kind: "terminal",
    note: "Backed by Gemini CLI settings.json MCP configuration.",
    vendor: "Google",
  },
  {
    id: "junie",
    label: "JetBrains Junie",
    shortLabel: "JB",
    status: "supported",
    kind: "editor",
    note: "Backed by Junie MCP configuration files.",
    vendor: "JetBrains",
  },
  {
    id: "kiro",
    label: "Kiro",
    shortLabel: "KR",
    status: "supported",
    kind: "editor",
    note: "Backed by Kiro MCP configuration files.",
    vendor: "Kiro",
  },
  {
    id: "trae",
    label: "Trae",
    shortLabel: "TR",
    status: "coming-soon",
    kind: "editor",
    note: "AI-first IDE on the roadmap for future bundle apply support.",
    vendor: "TRAE",
  },
  {
    id: "cline-cli",
    label: "Cline CLI",
    shortLabel: "CL",
    status: "supported",
    kind: "terminal",
    note: "Backed by the Cline CLI MCP settings file.",
    vendor: "Cline",
  },
];

export const SUPPORTED_TARGET_IDS = TARGET_OPTIONS
  .filter((target) => target.status === "supported")
  .map((target) => target.id);
