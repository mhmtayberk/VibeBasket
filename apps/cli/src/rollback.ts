import { select, confirm } from "@inquirer/prompts";
import type { IdeAdapter } from "@vibebasket/adapters";
import chalk from "chalk";
import fs from "node:fs";
import { listBackups } from "./backup.js";
import { 
  CursorAdapter, 
  AntigravityAdapter, 
  WindsurfAdapter, 
  VSCodeAdapter 
} from "@vibebasket/adapters";

const ADAPTERS = {
  cursor: new CursorAdapter(),
  antigravity: new AntigravityAdapter(),
  windsurf: new WindsurfAdapter(),
  vscode: new VSCodeAdapter(),
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

  const choices = backups.slice(0, 10).map(b => ({
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

  await adapter.writeConfig(selectedBackup.scope, config);
  console.log(chalk.green(`\n✅ Successfully restored ${selectedBackup.targetId} configuration.`));
}
