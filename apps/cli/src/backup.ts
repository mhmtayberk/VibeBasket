import fs from "node:fs";
import path from "node:path";

const BACKUP_DIR = ".vibebasket/backups";

function parseBackupFilename(filename: string) {
  const basename = filename.replace(/\.json$/, "");
  const firstSeparator = basename.indexOf("-");
  const secondSeparator = basename.indexOf("-", firstSeparator + 1);

  if (firstSeparator === -1 || secondSeparator === -1) {
    return null;
  }

  const targetId = basename.slice(0, firstSeparator);
  const scope = basename.slice(firstSeparator + 1, secondSeparator);
  const timestampSlug = basename.slice(secondSeparator + 1);
  const timestamp = timestampSlug.replace(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/,
    "$1-$2-$3T$4:$5:$6.$7Z",
  );

  return { targetId, scope, timestamp };
}

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
  return fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((filename) => {
      const parsed = parseBackupFilename(filename);
      if (!parsed) {
        return null;
      }

      return {
        filename,
        targetId: parsed.targetId,
        scope: parsed.scope,
        timestamp: parsed.timestamp,
        path: path.join(BACKUP_DIR, filename),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
