import type { BackupEntry, CreateBackupResult, StorageBackend, StorageBackendId } from "./types";

async function loadPath() {
  return (await import("node:path")).default;
}

async function loadFs() {
  return (await import("node:fs")).default;
}

async function sanitizeKey(key: string): Promise<string> {
  const path = await loadPath();
  return path.basename(key).replace(/[^a-zA-Z0-9._-]/g, "_");
}

export class LocalStorageBackend implements StorageBackend {
  readonly id: StorageBackendId = "local";
  readonly label = "Local Filesystem";
  readonly isConfigured = true;

  private backupsDir?: string;

  constructor(config?: { backupsDir?: string }) {
    this.backupsDir = config?.backupsDir ?? process.env.BACKUP_LOCAL_DIR ?? undefined;
  }

  private async resolveBackupsDir(): Promise<string> {
    if (this.backupsDir) {
      const path = await loadPath();
      return path.resolve(this.backupsDir);
    }

    const path = await loadPath();
    return path.resolve(path.join(/* turbopackIgnore: true */ process.cwd(), "backups"));
  }

  private async ensureDir(): Promise<void> {
    const fs = await loadFs();
    await fs.promises.mkdir(await this.resolveBackupsDir(), { recursive: true });
  }

  async createBackup(localPath: string, key: string): Promise<CreateBackupResult> {
    const fs = await loadFs();
    const path = await loadPath();
    await this.ensureDir();
    const safeKey = await sanitizeKey(key);
    const destPath = path.join(await this.resolveBackupsDir(), safeKey);
    await fs.promises.copyFile(path.resolve(localPath), destPath);
    const stat = await fs.promises.stat(destPath);
    return { key: safeKey, sizeBytes: stat.size, location: destPath };
  }

  async downloadBackup(key: string, destinationPath: string): Promise<void> {
    const fs = await loadFs();
    const path = await loadPath();
    const safeKey = await sanitizeKey(key);
    await fs.promises.copyFile(
      path.join(await this.resolveBackupsDir(), safeKey),
      path.resolve(destinationPath),
    );
  }

  async listBackups(): Promise<BackupEntry[]> {
    const fs = await loadFs();
    const path = await loadPath();
    const backupsDir = await this.resolveBackupsDir();
    try {
      await this.ensureDir();
    } catch {
      return [];
    }

    const entries = await fs.promises.readdir(backupsDir);
    const results: BackupEntry[] = [];

    for (const entry of entries) {
      const fullPath = path.join(backupsDir, entry);
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
    const fs = await loadFs();
    const path = await loadPath();
    const safeKey = await sanitizeKey(key);
    await fs.promises.unlink(path.join(await this.resolveBackupsDir(), safeKey));
  }
}
