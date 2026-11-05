import fs from "node:fs";
import path from "node:path";
import { assertPathWithoutSymbolicLinks } from "../../../../packages/adapters/src/safe-path.js";
import type { IdeId } from "../../../../packages/core/src/manifest.js";
import { listBackups } from "../backup.js";
import { getAdapter } from "../runtime/adapters.js";

export async function restoreBackupByPath(backupPathOrFilename: string) {
  const backups = listBackups();
  const backup = backups.find(
    (entry) => entry.path === backupPathOrFilename || entry.filename === backupPathOrFilename,
  );

  if (!backup) {
    throw new Error(`Backup not found: ${backupPathOrFilename}`);
  }

  const projectRoot = process.cwd();
  const backupRoot = path.resolve(projectRoot, ".vibebasket", "backups");
  const resolvedBackupPath = path.resolve(projectRoot, backup.path);
  if (path.dirname(resolvedBackupPath) !== backupRoot) {
    throw new Error(`Backup path escaped the backup directory: ${backup.filename}`);
  }
  await assertPathWithoutSymbolicLinks(projectRoot, backupRoot);
  await assertPathWithoutSymbolicLinks(projectRoot, resolvedBackupPath);

  const adapter = getAdapter(backup.targetId as IdeId);
  if (!adapter) {
    throw new Error(`No adapter found for target: ${backup.targetId}`);
  }

  const configContent = fs.readFileSync(resolvedBackupPath, "utf8");
  const config = JSON.parse(configContent);
  const adapterProjectRoot = backup.scope === "project" ? projectRoot : undefined;

  if (adapterProjectRoot) {
    await assertPathWithoutSymbolicLinks(
      adapterProjectRoot,
      adapter.configPath(backup.scope, adapterProjectRoot),
    );
  }

  await adapter.writeConfig(backup.scope, config, adapterProjectRoot);

  return {
    restored: true,
    targetId: backup.targetId,
    displayName: adapter.displayName,
    scope: backup.scope,
    path: backup.path,
    timestamp: backup.timestamp,
  };
}
