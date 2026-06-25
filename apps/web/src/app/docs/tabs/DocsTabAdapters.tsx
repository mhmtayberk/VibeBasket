import {
  RULES_SUPPORTED_TARGET_COUNT,
  SKILLS_SUPPORTED_TARGET_COUNT,
  SUPPORTED_TARGET_COUNT,
} from "@/lib/targets";
import { Power } from "lucide-react";
import Link from "next/link";

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
                  config:
                    ".cursor/mcp.json or ~/.cursor/mcp.json + .cursor/skills/ + .cursor/rules/",
                  capabilityLabel: "MCP + Skills + Rules",
                  note: "Workspace-scoped or user-scoped MCP JSON plus native Cursor skills/rules folders. Project scope takes precedence when you apply at workspace scope.",
                },
                {
                  name: "Windsurf",
                  color: "#33bbc5",
                  config:
                    "~/.codeium/windsurf/mcp_config.json + ~/.codeium/windsurf/skills/ or .windsurf/skills/ + global_rules.md or .devin/rules/",
                  capabilityLabel: "MCP + Skills + Rules",
                  note: "Windsurf documents MCP in mcp_config.json, SKILL.md folders under .windsurf/skills or ~/.codeium/windsurf/skills, and rules under .devin/rules/ with global rules in ~/.codeium/windsurf/memories/global_rules.md.",
                },
                {
                  name: "VS Code / Cline",
                  color: "#007ACC",
                  config:
                    "<VS Code globalStorage>/saoudrizwan.claude-dev/settings/cline_mcp_settings.json",
                  capabilityLabel: "MCP",
                  note: "Targets the Cline extension's global MCP settings file.",
                },
                {
                  name: "Claude Code",
                  color: "#D4A574",
                  config: "~/.claude.json",
                  capabilityLabel: "MCP + Skills",
                  note: "Anthropic's Claude Code CLI reads mcpServers from the root ~/.claude.json file.",
                },
                {
                  name: "Gemini CLI",
                  color: "#4285F4",
                  config: "~/.gemini/settings.json or .gemini/settings.json + .gemini/skills/",
                  capabilityLabel: "MCP + Skills",
                  note: "Gemini CLI reads MCP settings from settings.json and discovers skills from .gemini/skills/ at user or workspace scope.",
                },
                {
                  name: "Codex CLI",
                  color: "#10A37F",
                  config: "~/.codex/config.toml or .codex/config.toml",
                  capabilityLabel: "MCP",
                  note: "Codex CLI uses a TOML-formatted config for both user and trusted project scope. Remote MCP servers must serialize into Codex's native HTTP fields.",
                },
                {
                  name: "Antigravity",
                  color: "#a0fdda",
                  config: "~/.gemini/antigravity/mcp_config.json",
                  capabilityLabel: "MCP",
                  note: "Google Gemini's Antigravity agent reads MCP config from its own scoped path.",
                },
                {
                  name: "Zed",
                  color: "#084994",
                  config:
                    "~/.config/zed/settings.json (context_servers) + ~/.agents/skills/ or .agents/skills/",
                  capabilityLabel: "MCP + Skills",
                  note: "Zed uses context_servers inside settings.json and documents global/project Agent Skills under ~/.agents/skills/ and .agents/skills/.",
                },
                {
                  name: "JetBrains Junie",
                  color: "#FF318C",
                  config: "~/.junie/mcp/mcp.json or .junie/mcp/mcp.json",
                  capabilityLabel: "MCP",
                  note: "JetBrains Junie currently uses a dedicated .junie/mcp/mcp.json surface for user or project MCP configuration.",
                },
                {
                  name: "Kiro",
                  color: "#5B4FE9",
                  config: "~/.kiro/settings/mcp.json + ~/.kiro/skills/ or .kiro/skills/",
                  capabilityLabel: "MCP + Skills",
                  note: "Kiro stores MCP config in .kiro/settings/mcp.json and documents both global and workspace-scoped agent skills under .kiro/skills/.",
                },
                {
                  name: "Cline CLI",
                  color: "#5C6BC0",
                  config: "~/.cline/data/settings/cline_mcp_settings.json",
                  capabilityLabel: "MCP",
                  note: "Cline CLI reads its own MCP settings file from the CLI data directory. Skills/rules auto-apply is intentionally not advertised yet.",
                },
                {
                  name: "DeepSeek-TUI",
                  color: "#1C6EF2",
                  config: "~/.deepseek/mcp.json",
                  capabilityLabel: "MCP",
                  note: "DeepSeek-TUI reads MCP configuration from its scoped home directory. Skills/rules auto-apply is not yet supported.",
                },
                {
                  name: "Continue",
                  color: "#00E5FF",
                  config: "~/.continue/config.yaml + .continue/prompts/*.prompt",
                  capabilityLabel: "MCP + Skills",
                  note: "Continue's current config surface is config.yaml. MCP servers serialize into the documented mcpServers YAML list, while VibeBasket writes prompt files and registers them under prompts.",
                },
                {
                  name: "Roo Code",
                  color: "#FF3D00",
                  config:
                    ".roo/mcp.json or <VS Code globalStorage>/RooVeterinaryInc.roo-cline/settings/mcp_settings.json + .roo/skills/ + .roo/rules/",
                  capabilityLabel: "MCP + Skills + Rules",
                  note: "MCP entries merge into Roo Code's project or global settings file. Skills and rules are written into Roo-native .roo directories.",
                },
                {
                  name: "Hermes",
                  color: "#FFD600",
                  config: "~/.hermes/config.yaml + .hermesrules",
                  capabilityLabel: "MCP + Skills",
                  note: "MCP servers merge into the YAML config. Rules and skills are written into .hermesrules using idempotent block delimiters.",
                },
                {
                  name: "OpenClaw",
                  color: "#E040FB",
                  config: "~/.openclaw/openclaw.json + .openclawrules",
                  capabilityLabel: "MCP + Skills",
                  note: "MCP entries merge into the JSON config. Rules and skills are written into .openclawrules using idempotent block delimiters.",
                },
                {
                  name: "GitHub Copilot",
                  color: "#FF1744",
                  config: ".github/copilot-instructions.md",
                  capabilityLabel: "Skills + Rules",
                  note: "Rules and skills are written as Markdown custom instructions inside .github/copilot-instructions.md.",
                },
                {
                  name: "Void Editor",
                  color: "#673AB7",
                  config: "~/.void-editor/mcp.json",
                  capabilityLabel: "MCP",
                  note: "The current auto-apply surface is the official user-scope Void MCP config. Project-scoped skills/rules are intentionally not advertised until per-feature scope handling is modelled cleanly.",
                },
                {
                  name: "Aider",
                  color: "#4CAF50",
                  config: ".aider.conf.yml + .aiderinstructions.md",
                  capabilityLabel: "Skills + Rules",
                  note: "Registers .aiderinstructions.md via the read flag in .aider.conf.yml. Rules and skills are written into the instructions Markdown file.",
                },
                {
                  name: "Cortex Code",
                  color: "#29B6F6",
                  config: "~/.snowflake/cortex/mcp.json + .cortex/skills/",
                  capabilityLabel: "MCP + Skills",
                  note: "Snowflake's Cortex Code agent. MCP entries merge into the cortex JSON config. Skills are written as individual Markdown files under .cortex/skills/.",
                },
                {
                  name: "Goose",
                  color: "#FF6F00",
                  config: "~/.config/goose/config.yaml",
                  capabilityLabel: "MCP",
                  note: "Block/Anthropic's Goose agent reads MCP extensions from its YAML config file. Restart Goose after applying.",
                },
                {
                  name: "IBM Bob",
                  color: "#052FAD",
                  config: "~/.bob/mcp_settings.json or .bob/mcp.json",
                  capabilityLabel: "MCP + Skills",
                  note: "IBM Bob supports both user-global and project-scoped MCP config. Skills are written under .bob/skills/ as Markdown files.",
                },
                {
                  name: "CodeBuddy",
                  color: "#00BCD4",
                  config: "~/.codebuddy/.mcp.json or .mcp.json",
                  capabilityLabel: "MCP + Skills",
                  note: "Tencent Cloud CodeBuddy reads MCP config from user or project scope. Skills are written under .codebuddy/skills/ as Markdown files.",
                },
                {
                  name: "OpenCode",
                  color: "#8BC34A",
                  config:
                    "~/.config/opencode/opencode.json or opencode.json + .opencode/skills/ + AGENTS.md",
                  capabilityLabel: "MCP + Skills + Rules",
                  note: "OpenCode uses the mcp object in opencode.json, plus .opencode/skills and AGENTS.md for reusable behavior. Reload the TUI after applying.",
                },
              ] as {
                name: string;
                color: string;
                config: string;
                capabilityLabel: string;
                note: string;
              }[]
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
                  {adapter.capabilityLabel ? (
                    <span className="font-mono text-[8px] uppercase tracking-wider text-[#a0fdda] border border-[#a0fdda]/30 bg-[#a0fdda]/5 px-1.5 py-0.5 rounded-[2px] shrink-0">
                      {adapter.capabilityLabel}
                    </span>
                  ) : null}
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
