import fs from "node:fs";
import path from "node:path";

const BACKUP_DIR = ".vibebasket/backups";

export async function createBackup(targetId: string, scope: string, config: unknown) {
  if (!fs.existsSync(".vibebasket")) {
    fs.mkdirSync(".vibebasket");
  }
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${targetId}-${scope}-${timestamp}.json`;
  const backupPath = path.join(BACKUP_DIR, filename);

  fs.writeFileSync(backupPath, JSON.stringify(config, null, 2));
  return backupPath;
}

export function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => {
      const parts = f.replace(".json", "").split("-");
      const targetId = parts[0];
      const scope = parts[1];
      const timestamp = parts.slice(2).join("-").replace(/-/g, ":");
      return { filename: f, targetId, scope, timestamp, path: path.join(BACKUP_DIR, f) };
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
