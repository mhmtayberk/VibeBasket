import Link from "next/link";
import { Power } from "lucide-react";
import {
  RULES_SUPPORTED_TARGET_COUNT,
  SKILLS_SUPPORTED_TARGET_COUNT,
  SUPPORTED_TARGET_COUNT,
} from "@/lib/targets";

export function DocsTabAdapters() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-12 flex items-center gap-2 select-none">
        <Link
          href="/docs"
          className="opacity-80 hover:text-[#a0fdda] transition-colors cursor-pointer"
        >
          Docs
        </Link>
        <span className="text-[#bdc9c2]/30">/</span>
        <span className="text-foreground">IDE Adapters</span>
      </div>

      <div className="mb-24">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
          IDE Adapters
        </h1>
        <p className="text-base sm:text-lg text-[#bdc9c2] max-w-3xl leading-relaxed">
          {SUPPORTED_TARGET_COUNT} supported targets, each with its own adapter that reads the
          target&apos;s config format, merges entries idempotently, and backs up the original file
          before writing. MCP configuration is supported on every MCP-capable adapter. Skills are
          auto-applied on {SKILLS_SUPPORTED_TARGET_COUNT} targets and rules on{" "}
          {RULES_SUPPORTED_TARGET_COUNT}. The CLI now performs post-install verification so adapter
          writes are checked again after persistence.
        </p>
      </div>

      <div className="space-y-28 border-t border-[#3e4944]/50 pt-20">
        <section className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <Power className="h-6 w-6 text-[#ff5722]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Representative Targets
            </h2>
          </div>
          <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-10">
            Each adapter is a standalone module in{" "}
            <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              packages/adapters
            </code>
            . It resolves the target config path, merges the new MCP entries (and optionally
            skills/rules), creates a timestamped backup before writing, and is expected to pass a
            post-install verification step in the CLI.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
            {(
              [
                {
                  name: "Cursor",
                  color: "#ff5722",
                  config: ".cursor/mcp.json or ~/.cursor/mcp.json",
                  skills: false,
                  note: "Workspace-scoped or user-scoped JSON. Both paths are checked; workspace takes precedence.",
                },
                {
                  name: "Windsurf",
                  color: "#33bbc5",
                  config: "~/.codeium/windsurf/mcp_config.json",
                  skills: false,
                  note: "Global user-scoped MCP config. Entries are merged under the mcpServers key.",
                },
                {
                  name: "VS Code / Cline",
                  color: "#007ACC",
                  config:
                    "~/.vscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json",
                  skills: false,
                  note: "Targets the Cline extension's global MCP settings file.",
                },
                {
                  name: "Claude Code",
                  color: "#D4A574",
                  config: "~/.claude.json",
                  skills: true,
                  note: "Anthropic's Claude Code CLI reads mcpServers from the root ~/.claude.json file.",
                },
                {
                  name: "Gemini CLI",
                  color: "#4285F4",
                  config: "~/.gemini/settings.json",
                  skills: false,
                  note: "Google's Gemini CLI reads mcpServers from its settings.json file.",
                },
                {
                  name: "Codex CLI",
                  color: "#10A37F",
                  config: "~/.codex/config.toml",
                  skills: false,
                  note: "OpenAI Codex CLI uses a TOML-formatted config. Single and double-quoted server identifiers are both handled.",
                },
                {
                  name: "Antigravity",
                  color: "#a0fdda",
                  config: "~/.gemini/antigravity/mcp_config.json",
                  skills: false,
                  note: "Google Gemini's Antigravity agent reads MCP config from its own scoped path.",
                },
                {
                  name: "Zed",
                  color: "#084994",
                  config: "~/.config/zed/settings.json (context_servers key)",
                  skills: false,
                  note: "Zed uses context servers instead of the MCP mcpServers convention. The adapter maps accordingly.",
                },
                {
                  name: "JetBrains Junie",
                  color: "#FF318C",
                  config: "~/.junie/mcp.json",
                  skills: false,
                  note: "JetBrains Junie uses a dedicated ~/.junie directory for MCP server configuration.",
                },
                {
                  name: "Kiro",
                  color: "#5B4FE9",
                  config: "~/.kiro/settings/mcp.json",
                  skills: false,
                  note: "Amazon's Kiro IDE stores MCP configuration in its settings directory.",
                },
                {
                  name: "Cline CLI",
                  color: "#5C6BC0",
                  config:
                    "~/.vscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json",
                  skills: false,
                  note: "Shares the same MCP settings path as VS Code / Cline but is applied from the terminal.",
                },
                {
                  name: "DeepSeek-TUI",
                  color: "#1C6EF2",
                  config: "~/.deepseek/mcp.json",
                  skills: false,
                  note: "DeepSeek-TUI reads MCP configuration from its scoped home directory. Skills/rules auto-apply is not yet supported.",
                },
                {
                  name: "Continue",
                  color: "#00E5FF",
                  config: "~/.continue/config.json + .continue/prompts/*.prompt",
                  skills: true,
                  note: "MCP servers merge into the config.json mcpServers array. Skills are written as .prompt files under .continue/prompts/.",
                },
                {
                  name: "Roo Code",
                  color: "#FF3D00",
                  config: "roocode_mcp_settings.json + .clinerules",
                  skills: true,
                  note: "MCP entries merge into roocode_mcp_settings.json. Rules and skills are written into .clinerules using the VibeBasket block delimiter engine.",
                },
                {
                  name: "Hermes",
                  color: "#FFD600",
                  config: "~/.hermes/config.yaml + .hermesrules",
                  skills: true,
                  note: "MCP servers merge into the YAML config. Rules and skills are written into .hermesrules using idempotent block delimiters.",
                },
                {
                  name: "OpenClaw",
                  color: "#E040FB",
                  config: "~/.openclaw/openclaw.json + .openclawrules",
                  skills: true,
                  note: "MCP entries merge into the JSON config. Rules and skills are written into .openclawrules using idempotent block delimiters.",
                },
                {
                  name: "GitHub Copilot",
                  color: "#FF1744",
                  config: ".github/copilot-instructions.md",
                  skills: true,
                  note: "Rules and skills are written as Markdown custom instructions inside .github/copilot-instructions.md.",
                },
                {
                  name: "Void Editor",
                  color: "#673AB7",
                  config: "~/.config/void/mcp_servers.json + .voidrules",
                  skills: true,
                  note: "MCP servers merge into the mcp_servers.json. Rules and skills are written into .voidrules and .clinerules using idempotent block delimiters.",
                },
                {
                  name: "Aider",
                  color: "#4CAF50",
                  config: ".aider.conf.yml + .aiderinstructions.md",
                  skills: true,
                  note: "Registers .aiderinstructions.md via the read flag in .aider.conf.yml. Rules and skills are written into the instructions Markdown file.",
                },
              ] as { name: string; color: string; config: string; skills: boolean; note: string }[]
            ).map((adapter) => (
              <div
                key={adapter.name}
                className="p-7 border border-[#3e4944] bg-[#181d1a] rounded-[2px] hover:bg-[#202622] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 group"
                style={{ "--hover-color": adapter.color } as React.CSSProperties}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-foreground font-semibold font-mono text-xs uppercase tracking-wide flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: adapter.color }}
                    />
                    {adapter.name}
                  </h4>
                  {adapter.skills && (
                    <span className="font-mono text-[8px] uppercase tracking-wider text-[#a0fdda] border border-[#a0fdda]/30 bg-[#a0fdda]/5 px-1.5 py-0.5 rounded-[2px] shrink-0">
                      MCP + Skills
                    </span>
                  )}
                </div>
                <code className="font-mono text-[9px] text-[#bdc9c2]/70 bg-[#0a0f0d] border border-[#3e4944]/60 px-2 py-1 rounded-[2px] block mb-3 break-all">
                  {adapter.config}
                </code>
                <p className="text-xs text-[#bdc9c2]/80 leading-relaxed">{adapter.note}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
