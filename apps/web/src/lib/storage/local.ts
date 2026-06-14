import fs from "node:fs";
import path from "node:path";
import type { BackupEntry, CreateBackupResult, StorageBackend, StorageBackendId } from "./types";

function sanitizeKey(key: string): string {
  return path.basename(key).replace(/[^a-zA-Z0-9._-]/g, "_");
}

export class LocalStorageBackend implements StorageBackend {
  readonly id: StorageBackendId = "local";
  readonly label = "Local Filesystem";
  readonly isConfigured = true;

  private backupsDir: string;

  constructor(config?: { backupsDir?: string }) {
    this.backupsDir = path.resolve(
      config?.backupsDir ??
        process.env.BACKUP_LOCAL_DIR ??
        path.join(/* turbopackIgnore: true */ process.cwd(), "backups"),
    );
  }

  private async ensureDir(): Promise<void> {
    await fs.promises.mkdir(this.backupsDir, { recursive: true });
  }

  async createBackup(localPath: string, key: string): Promise<CreateBackupResult> {
    await this.ensureDir();
    const safeKey = sanitizeKey(key);
    const destPath = path.join(this.backupsDir, safeKey);
    await fs.promises.copyFile(path.resolve(localPath), destPath);
    const stat = await fs.promises.stat(destPath);
    return { key: safeKey, sizeBytes: stat.size, location: destPath };
  }

  async downloadBackup(key: string, destinationPath: string): Promise<void> {
    const safeKey = sanitizeKey(key);
    await fs.promises.copyFile(path.join(this.backupsDir, safeKey), path.resolve(destinationPath));
  }

  async listBackups(): Promise<BackupEntry[]> {
    try {
      await this.ensureDir();
    } catch {
      return [];
    }

    const entries = await fs.promises.readdir(this.backupsDir);
    const results: BackupEntry[] = [];

    for (const entry of entries) {
      const fullPath = path.join(this.backupsDir, entry);
      try {
        const stat = await fs.promises.stat(fullPath);
        if (stat.isFile()) {
          results.push({
            key: entry,
            sizeBytes: stat.size,
            lastModified: stat.mtime,
          });
        }
      } catch {}
    }

    return results.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  }

  async deleteBackup(key: string): Promise<void> {
    const safeKey = sanitizeKey(key);
    await fs.promises.unlink(path.join(this.backupsDir, safeKey));
  }
}
