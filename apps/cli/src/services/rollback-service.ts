import fs from "node:fs";
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

  const adapter = getAdapter(backup.targetId as IdeId);
  if (!adapter) {
    throw new Error(`No adapter found for target: ${backup.targetId}`);
  }

  const configContent = fs.readFileSync(backup.path, "utf8");
  const config = JSON.parse(configContent);
  const projectRoot = backup.scope === "project" ? process.cwd() : undefined;

  await adapter.writeConfig(backup.scope, config, projectRoot);

  return {
    restored: true,
    targetId: backup.targetId,
    displayName: adapter.displayName,
    scope: backup.scope,
    path: backup.path,
    timestamp: backup.timestamp,
  };
}
