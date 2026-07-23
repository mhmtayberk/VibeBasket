import { TARGET_CAPABILITIES } from "../../../../packages/adapters/src/target-capabilities.js";
import {
  getBaseVibeBasketServerDefinition,
  getLocalVibeBasketMcpSnippet,
  VIBEBASKET_MCP_SERVER_ID,
} from "../../../../packages/core/src/local-mcp-snippets.js";
import type { IdeId, Scope } from "../../../../packages/core/src/manifest.js";

type TargetKind = "editor" | "terminal";

type TargetGuideMetadata = {
  label: string;
  vendor: string;
  kind: TargetKind;
  note: string;
  configPathHints: Partial<Record<Scope, string>>;
  mcpFieldHint?: string;
  postInstallHint?: string;
};

const TARGET_GUIDES: Record<IdeId, TargetGuideMetadata> = {
  antigravity: {
    label: "Antigravity",
    vendor: "Google",
    kind: "editor",
    note: "Applies through the Gemini Antigravity MCP config path.",
    configPathHints: {
      user: "~/.gemini/antigravity/mcp_config.json",
      project: "<project-root>/.gemini/antigravity/mcp_config.json",
    },
    mcpFieldHint: "Add an mcpServers.vibebasket entry in the JSON config.",
    postInstallHint: "Restart Antigravity or reload the conversation for MCP changes to take effect.",
  },
  "claude-code": {
    label: "Claude Code",
    vendor: "Anthropic",
    kind: "terminal",
    note: "Backed by Claude Code MCP configuration files plus documented skills surfaces.",
    configPathHints: {
      user: "~/.claude.json",
      project: "<project-root>/.claude.json",
    },
    mcpFieldHint: "Add a root-level mcpServers.vibebasket entry.",
    postInstallHint: "Restart Claude Code or reload the session so the MCP server is discovered.",
  },
  "cline-cli": {
    label: "Cline CLI",
    vendor: "Cline",
    kind: "terminal",
    note: "Backed by the Cline CLI MCP settings file.",
    configPathHints: {
      user: "~/.cline/data/settings/cline_mcp_settings.json",
    },
    mcpFieldHint: "Add an mcpServers.vibebasket entry in the JSON settings file.",
    postInstallHint: "Restart Cline CLI or reload its MCP settings after editing the config.",
  },
  "deepseek-tui": {
    label: "DeepSeek-TUI",
    vendor: "DeepSeek",
    kind: "terminal",
    note: "Backed by DeepSeek-TUI MCP configuration.",
    configPathHints: {
      user: "~/.deepseek/mcp.json",
    },
    mcpFieldHint: "Add an mcpServers.vibebasket entry in the JSON config.",
    postInstallHint: "Restart DeepSeek-TUI so the MCP server is discovered.",
  },
  codex: {
    label: "Codex CLI",
    vendor: "OpenAI",
    kind: "terminal",
    note: "Backed by user and trusted project Codex config.toml MCP configuration.",
    configPathHints: {
      user: "~/.codex/config.toml",
      project: "<project-root>/.codex/config.toml",
    },
    mcpFieldHint: "Add the vibebasket server under Codex's MCP server table in TOML form.",
    postInstallHint: "Restart Codex CLI or open a new task after editing config.toml.",
  },
  continue: {
    label: "Continue",
    vendor: "Continue",
    kind: "editor",
    note: "Backed by config.yaml MCP configuration plus prompt references.",
    configPathHints: {
      user: "~/.continue/config.yaml",
      project: "<project-root>/.continue/config.yaml",
    },
    mcpFieldHint: "Add a vibebasket entry inside Continue's mcpServers YAML list.",
    postInstallHint: "Restart Continue or reload the extension to pick up MCP changes.",
  },
  cursor: {
    label: "Cursor",
    vendor: "Cursor",
    kind: "editor",
    note: "Backed by native Cursor MCP config plus documented skills and rules directories.",
    configPathHints: {
      user: "~/.cursor/mcp.json",
      project: "<project-root>/.cursor/mcp.json",
    },
    mcpFieldHint: "Add an mcpServers.vibebasket entry in the JSON config.",
    postInstallHint: "Restart Cursor or open a new workspace session after editing the MCP config.",
  },
  "gemini-cli": {
    label: "Gemini CLI",
    vendor: "Google",
    kind: "terminal",
    note: "Backed by Gemini CLI settings plus .gemini/skills discovery.",
    configPathHints: {
      user: "~/.gemini/settings.json",
      project: "<project-root>/.gemini/settings.json",
    },
    mcpFieldHint: "Add an mcpServers.vibebasket entry in settings.json.",
    postInstallHint: "Restart Gemini CLI or reopen the session so the MCP server is loaded.",
  },
  junie: {
    label: "JetBrains Junie",
    vendor: "JetBrains",
    kind: "editor",
    note: "Backed by Junie MCP configuration files.",
    configPathHints: {
      user: "~/.junie/mcp/mcp.json",
      project: "<project-root>/.junie/mcp/mcp.json",
    },
    mcpFieldHint: "Add an mcpServers.vibebasket entry in the JSON config.",
    postInstallHint: "Restart Junie CLI or reopen the MCP settings screen to verify activation.",
  },
  kiro: {
    label: "Kiro",
    vendor: "Kiro",
    kind: "editor",
    note: "Backed by Kiro MCP configuration plus documented skills directories.",
    configPathHints: {
      user: "~/.kiro/settings/mcp.json",
      project: "<project-root>/.kiro/settings/mcp.json",
    },
    mcpFieldHint: "Add an mcpServers.vibebasket entry in the JSON config.",
    postInstallHint: "Restart Kiro or reload the workspace after updating MCP config.",
  },
  vscode: {
    label: "VS Code / Cline",
    vendor: "Microsoft / Cline",
    kind: "editor",
    note: "Targets the local Cline extension MCP settings file.",
    configPathHints: {
      user: "<VS Code globalStorage>/saoudrizwan.claude-dev/settings/cline_mcp_settings.json",
      project: "<VS Code globalStorage>/saoudrizwan.claude-dev/settings/cline_mcp_settings.json",
    },
    mcpFieldHint: "Add an mcpServers.vibebasket entry in the extension settings JSON.",
    postInstallHint: "Reload VS Code or restart the Cline extension after editing settings.",
  },
  windsurf: {
    label: "Windsurf",
    vendor: "Windsurf",
    kind: "editor",
    note: "Backed by Windsurf MCP config plus documented skills and rules surfaces.",
    configPathHints: {
      user: "~/.codeium/windsurf/mcp_config.json",
      project: "<project-root>/.codeium/windsurf/mcp_config.json",
    },
    mcpFieldHint: "Add an mcpServers.vibebasket entry in Windsurf's JSON config.",
    postInstallHint: "Restart Windsurf or reload the workspace after updating MCP config.",
  },
  zed: {
    label: "Zed",
    vendor: "Zed Industries",
    kind: "editor",
    note: "Backed by Zed context server settings plus documented .agents/skills directories.",
    configPathHints: {
      user: "~/.config/zed/settings.json",
      project: "<project-root>/.zed/settings.json",
    },
    mcpFieldHint: "Add a vibebasket entry inside Zed's context_servers block.",
    postInstallHint: "Restart Zed or reload the context server settings after editing the file.",
  },
  roocode: {
    label: "Roo Code",
    vendor: "Roo Code",
    kind: "editor",
    note: "Backed by project or global Roo MCP config plus Roo-native skills and rules surfaces.",
    configPathHints: {
      user: "<VS Code globalStorage>/RooVeterinaryInc.roo-cline/settings/mcp_settings.json",
      project: "<project-root>/.roo/mcp.json",
    },
    mcpFieldHint: "Add an mcpServers.vibebasket entry in Roo's MCP settings JSON.",
    postInstallHint: "Restart Roo Code or reload the project so the new MCP server is discovered.",
  },
  hermes: {
    label: "Hermes",
    vendor: "Hermes",
    kind: "terminal",
    note: "Backed by ~/.hermes/config.yaml MCP configuration and project-level .hermesrules.",
    configPathHints: {
      project: "~/.hermes/config.yaml",
    },
    mcpFieldHint: "Add a vibebasket block under Hermes mcp_servers in YAML form.",
    postInstallHint: "Restart Hermes or reload the terminal for configuration changes to take effect.",
  },
  openclaw: {
    label: "OpenClaw",
    vendor: "OpenClaw",
    kind: "terminal",
    note: "Backed by ~/.openclaw/openclaw.json MCP configuration and project-level .openclawrules.",
    configPathHints: {
      project: "~/.openclaw/openclaw.json",
    },
    mcpFieldHint: "Add an mcpServers.vibebasket entry in the JSON config.",
    postInstallHint: "Restart OpenClaw after updating the MCP config.",
  },
  "github-copilot": {
    label: "GitHub Copilot",
    vendor: "GitHub / Microsoft",
    kind: "editor",
    note: "Current auto-apply support covers skills and rules only; MCP configuration is not modeled.",
    configPathHints: {
      project: ".github/copilot-instructions.md",
    },
  },
  void: {
    label: "Void Editor",
    vendor: "Void",
    kind: "editor",
    note: "Backed by the official user-scope Void MCP config.",
    configPathHints: {
      user: "~/.void-editor/mcp.json",
    },
    mcpFieldHint: "Add an mcpServers.vibebasket entry in the JSON config.",
    postInstallHint: "Restart Void Editor after updating the MCP config.",
  },
  aider: {
    label: "Aider",
    vendor: "Aider",
    kind: "terminal",
    note: "Current auto-apply support covers rules and skills only; MCP configuration is not modeled.",
    configPathHints: {
      project: "<project-root>/.aider.conf.yml",
    },
  },
  "cortex-code": {
    label: "Cortex Code",
    vendor: "Snowflake",
    kind: "terminal",
    note: "Backed by Cortex MCP config plus .cortex/skills.",
    configPathHints: {
      user: "~/.snowflake/cortex/mcp.json",
      project: "<project-root>/.snowflake/cortex/mcp.json",
    },
    mcpFieldHint: "Add an mcpServers.vibebasket entry in the JSON config.",
    postInstallHint: "Restart Cortex Code or reopen the session after editing the MCP config.",
  },
  goose: {
    label: "Goose",
    vendor: "Block / Linux Foundation",
    kind: "terminal",
    note: "Backed by Goose YAML config.",
    configPathHints: {
      user: "~/.config/goose/config.yaml",
    },
    mcpFieldHint: "Add a vibebasket entry inside the Goose extensions config.",
    postInstallHint: "Restart Goose or reload the terminal for configuration changes to take effect.",
  },
  "ibm-bob": {
    label: "IBM Bob",
    vendor: "IBM",
    kind: "editor",
    note: "Backed by ~/.bob/mcp_settings.json and project-scoped .bob/mcp.json.",
    configPathHints: {
      user: "~/.bob/mcp_settings.json",
      project: "<project-root>/.bob/mcp.json",
    },
    mcpFieldHint: "Add an mcpServers.vibebasket entry in the JSON config.",
    postInstallHint: "Restart IBM Bob or reload the window for MCP changes to take effect.",
  },
  codebuddy: {
    label: "CodeBuddy",
    vendor: "Tencent Cloud",
    kind: "editor",
    note: "Backed by user and project JSON MCP config.",
    configPathHints: {
      user: "~/.codebuddy/.mcp.json",
      project: "<project-root>/.mcp.json",
    },
    mcpFieldHint: "Add an mcpServers.vibebasket entry in the JSON config.",
    postInstallHint: "Restart CodeBuddy after editing the MCP config.",
  },
  opencode: {
    label: "OpenCode",
    vendor: "Anomaly",
    kind: "terminal",
    note: "Backed by opencode.json plus .opencode skills and AGENTS.md rules.",
    configPathHints: {
      user: "~/.config/opencode/opencode.json",
      project: "<project-root>/opencode.json",
    },
    mcpFieldHint: "Add an mcpServers.vibebasket entry in the JSON config.",
    postInstallHint: "Restart OpenCode or open a fresh session after updating the config.",
  },
};

function buildRecommendedSteps(targetId: IdeId, scope: Scope, supportsMcp: boolean) {
  if (!supportsMcp) {
    return [
      "This target does not expose MCP auto-install support in VibeBasket today.",
      "Use VibeBasket for skills/rules on this target, or connect VibeBasket MCP from another IDE that supports custom MCP clients.",
    ];
  }

  const scopeLabel = scope === "project" ? "project-scoped" : "user-scoped";
  return [
    `Add the VibeBasket MCP server entry to the ${scopeLabel} config surface for this target.`,
    "Restart or reload the target so the new MCP server is discovered.",
    "Call session.get_state from the connected MCP client before saving stacks or applying changes.",
  ];
}

export function listTargetGuides() {
  return (Object.entries(TARGET_GUIDES) as Array<[IdeId, TargetGuideMetadata]>)
    .map(([targetId, metadata]) => {
      const capabilities = TARGET_CAPABILITIES[targetId];
      return {
        targetId,
        label: metadata.label,
        vendor: metadata.vendor,
        kind: metadata.kind,
        note: metadata.note,
        supportsMcp: capabilities.supportsMcp,
        supportsSkills: capabilities.supportsSkills,
        supportsRules: capabilities.supportsRules,
        supportedScopes: [...capabilities.supportedScopes],
      };
    })
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function getTargetSetupGuide(targetId: IdeId, scope: Scope = "user") {
  const metadata = TARGET_GUIDES[targetId];
  const capabilities = TARGET_CAPABILITIES[targetId];

  if (!metadata || !capabilities) {
    throw new Error(`Unsupported target: ${targetId}`);
  }

  const scopeSupported = capabilities.supportedScopes.includes(scope);
  const configPathHint = metadata.configPathHints[scope] ?? null;

  return {
    targetId,
    label: metadata.label,
    vendor: metadata.vendor,
    kind: metadata.kind,
    note: metadata.note,
    scopeRequested: scope,
    scopeSupported,
    supportedScopes: [...capabilities.supportedScopes],
    supportsMcp: capabilities.supportsMcp,
    supportsSkills: capabilities.supportsSkills,
    supportsRules: capabilities.supportsRules,
    configPathHint,
    mcpFieldHint: metadata.mcpFieldHint ?? null,
    vibebasketServer:
      capabilities.supportsMcp && scopeSupported
        ? {
            ...getBaseVibeBasketServerDefinition(),
            postInstallHint: metadata.postInstallHint ?? "Restart the client after updating its MCP config.",
          }
        : null,
    recommendedSteps: buildRecommendedSteps(targetId, scope, capabilities.supportsMcp && scopeSupported),
  };
}

export function getTargetMcpSnippet(targetId: IdeId, scope: Scope = "user") {
  const metadata = TARGET_GUIDES[targetId];
  const capabilities = TARGET_CAPABILITIES[targetId];

  if (!metadata || !capabilities) {
    throw new Error(`Unsupported target: ${targetId}`);
  }

  const scopeSupported = capabilities.supportedScopes.includes(scope);
  const configPathHint = metadata.configPathHints[scope] ?? null;
  const renderer =
    capabilities.supportsMcp && scopeSupported ? getLocalVibeBasketMcpSnippet(targetId) : null;

  return {
    targetId,
    label: metadata.label,
    vendor: metadata.vendor,
    scopeRequested: scope,
    scopeSupported,
    supportedScopes: [...capabilities.supportedScopes],
    supportsMcp: capabilities.supportsMcp,
    configPathHint,
    snippetLanguage: renderer?.format ?? null,
    rootField: renderer?.rootField ?? null,
    snippetIsFragment: renderer !== null,
    mergeStrategyNote: renderer?.mergeStrategyNote ?? null,
    snippet: renderer?.snippet ?? null,
    vibebasketServer: renderer !== null ? getBaseVibeBasketServerDefinition() : null,
    postInstallHint: metadata.postInstallHint ?? null,
    notes:
      renderer !== null
        ? [
            "This is a merge fragment, not a whole config file.",
            "Preserve existing user config and only add the vibebasket server entry.",
          ]
        : [
            "This target does not expose MCP auto-install support in VibeBasket today.",
            "Use another MCP-capable client when you want to access the local VibeBasket MCP server.",
          ],
  };
}
