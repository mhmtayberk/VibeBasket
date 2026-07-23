import { confirm, select } from "@inquirer/prompts";
import chalk from "chalk";
import { listBackups } from "./backup.js";
import { restoreBackupByPath } from "./services/rollback-service.js";

const MAX_BACKUPS_SHOWN = 10;

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

  await restoreBackupByPath(selectedBackup.path);
  console.log(chalk.green(`\n✅ Successfully restored ${selectedBackup.targetId} configuration.`));
}
