import {
  AiderAdapter,
  AntigravityAdapter,
  ClaudeCodeAdapter,
  ClineCliAdapter,
  CodeBuddyAdapter,
  CodexAdapter,
  ContinueAdapter,
  CortexCodeAdapter,
  CursorAdapter,
  DeepSeekTuiAdapter,
  GeminiCliAdapter,
  GitHubCopilotAdapter,
  GooseAdapter,
  HermesAdapter,
  IBMBobAdapter,
  JunieAdapter,
  KiroAdapter,
  OpenClawAdapter,
  OpenCodeAdapter,
  RooCodeAdapter,
  VSCodeAdapter,
  VoidAdapter,
  WindsurfAdapter,
  ZedAdapter,
} from "@vibebasket/adapters";
import type { IdeAdapter } from "@vibebasket/adapters";
import type { IdeId } from "../../../packages/core/src/manifest.js";

export const ADAPTERS: Record<IdeId, IdeAdapter> = {
  cursor: new CursorAdapter(),
  antigravity: new AntigravityAdapter(),
  windsurf: new WindsurfAdapter(),
  vscode: new VSCodeAdapter(),
  "claude-code": new ClaudeCodeAdapter(),
  "deepseek-tui": new DeepSeekTuiAdapter(),
  "gemini-cli": new GeminiCliAdapter(),
  kiro: new KiroAdapter(),
  junie: new JunieAdapter(),
  "cline-cli": new ClineCliAdapter(),
  zed: new ZedAdapter(),
  codex: new CodexAdapter(),
  continue: new ContinueAdapter(),
  roocode: new RooCodeAdapter(),
  hermes: new HermesAdapter(),
  openclaw: new OpenClawAdapter(),
  "github-copilot": new GitHubCopilotAdapter(),
  void: new VoidAdapter(),
  aider: new AiderAdapter(),
  "cortex-code": new CortexCodeAdapter(),
  goose: new GooseAdapter(),
  "ibm-bob": new IBMBobAdapter(),
  codebuddy: new CodeBuddyAdapter(),
  opencode: new OpenCodeAdapter(),
};

export function getAdapter(targetId: IdeId): IdeAdapter | undefined {
  return ADAPTERS[targetId];
}

export function getAllAdapters(): Array<[IdeId, IdeAdapter]> {
  return Object.entries(ADAPTERS) as Array<[IdeId, IdeAdapter]>;
}
