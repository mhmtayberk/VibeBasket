import fs from "node:fs";
import { confirm, select } from "@inquirer/prompts";
import type { IdeAdapter } from "@vibebasket/adapters";
import chalk from "chalk";
import { listBackups } from "./backup.js";

const MAX_BACKUPS_SHOWN = 10;
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

const ADAPTERS = {
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
} as const;

function getRollbackAdapter(targetId: string): IdeAdapter | undefined {
  return ADAPTERS[targetId as keyof typeof ADAPTERS];
}

export async function runRollback() {
  console.log(chalk.yellow("🧺 VibeBasket: Rollback utility\n"));

  const backups = listBackups();

  if (backups.length === 0) {
    console.log(chalk.red("❌ No backups found."));
    return;
  }

  const choices = backups.slice(0, MAX_BACKUPS_SHOWN).map((b) => ({
    name: `${b.targetId} (${b.scope}) - ${b.timestamp}`,
    value: b,
  }));

  const selectedBackup = await select({
    message: "Select a backup to restore:",
    choices,
  });

  const ok = await confirm({
    message: `Are you sure you want to restore the configuration for ${chalk.bold(selectedBackup.targetId)} from ${selectedBackup.timestamp}?`,
    default: false,
  });

  if (!ok) {
    console.log(chalk.red("Aborted."));
    return;
  }

  const targetId = selectedBackup.targetId as string;
  const adapter = getRollbackAdapter(targetId);
  if (!adapter) {
    throw new Error(`No adapter found for target: ${targetId}`);
  }

  const configContent = fs.readFileSync(selectedBackup.path, "utf-8");
  const config = JSON.parse(configContent);
  const projectRoot = selectedBackup.scope === "project" ? process.cwd() : undefined;

  await adapter.writeConfig(selectedBackup.scope, config, projectRoot);
  console.log(chalk.green(`\n✅ Successfully restored ${selectedBackup.targetId} configuration.`));
}
