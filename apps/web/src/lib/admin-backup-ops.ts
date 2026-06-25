import { buildReleaseReadinessReport } from "@/lib/release-readiness";
import type { BackendStatus, BackupEntry, StorageConfig } from "@/lib/storage";

async function loadNodeFs() {
  return (await import("node:fs")).default;
}

async function loadStorageRuntime() {
  return import("@/lib/storage");
}

async function loadNodePath() {
  return (await import("node:path")).default;
}

function resolveDatabaseFilePath(): string | null {
  const url = process.env.DATABASE_URL ?? "file:vibebasket.db";

  if (url.startsWith("file:")) {
    return url.slice(5);
  }

  return null;
}

export async function runBackupDatabase() {
  const { createStorageBackend } = await loadStorageRuntime();
  const backend = await createStorageBackend();
  const resolvedDbPath = resolveDatabaseFilePath();
  if (!resolvedDbPath) {
    return {
      success: false as const,
      error: "Backups currently require a local SQLite file DATABASE_URL (file:...).",
    };
  }
  const path = await loadNodePath();
  const dbPath = path.resolve(resolvedDbPath);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const key = `vibebasket-backup-${timestamp}.db`;
  let result: { key: string; sizeBytes: number; location?: string };

  if (backend.id === "local") {
    const fs = await loadNodeFs();
    const backupDir = path.resolve(
      process.env.BACKUP_LOCAL_DIR ??
        path.join(/* turbopackIgnore: true */ process.cwd(), "backups"),
    );
    await fs.promises.mkdir(backupDir, { recursive: true });
    const safeKey = path.basename(key).replace(/[^a-zA-Z0-9._-]/g, "_");
    const destPath = path.join(backupDir, safeKey);

    try {
      const { client } = await import("@vibebasket/core");
      await client.execute(`VACUUM INTO '${destPath.replace(/'/g, "''")}'`);
    } catch {
      await fs.promises.copyFile(dbPath, destPath);
    }

    const stat = await fs.promises.stat(destPath);
    result = { key: safeKey, sizeBytes: stat.size, location: destPath };
  } else {
    result = await backend.createBackup(dbPath, key);
  }

  return {
    success: true as const,
    backup: {
      key: result.key,
      sizeBytes: result.sizeBytes,
      location: result.location ?? "",
      storageLabel: backend.label,
      createdAt: new Date().toISOString(),
    },
  };
}

async function maybeRunScheduledBackup() {
  const { isScheduleDue, markScheduleComplete } = await loadStorageRuntime();

  if (!(await isScheduleDue())) {
    return;
  }

  const result = await runBackupDatabase();
  if (result.success) {
    await markScheduleComplete();
  }
}

export async function runListBackups() {
  const { createStorageBackend } = await loadStorageRuntime();
  const backend = await createStorageBackend();
  const entries = await backend.listBackups();

  const backups: BackupEntry[] = entries.map((entry) => ({
    key: entry.key,
    sizeBytes: entry.sizeBytes,
    lastModified: entry.lastModified,
  }));

  return {
    success: true as const,
    backups,
    storageLabel: backend.label,
  };
}

export async function runDeleteBackup(key: string) {
  const { createStorageBackend } = await loadStorageRuntime();
  const backend = await createStorageBackend();
  await backend.deleteBackup(key);
  return { success: true as const };
}

export async function runRestoreBackup(key: string) {
  const fs = await loadNodeFs();
  const path = await loadNodePath();
  const { createStorageBackend } = await loadStorageRuntime();
  const backend = await createStorageBackend();
  const resolvedDbPath = resolveDatabaseFilePath();
  if (!resolvedDbPath) {
    return {
      success: false as const,
      error: "Restore currently requires a local SQLite file DATABASE_URL (file:...).",
    };
  }
  const dbPath = path.resolve(resolvedDbPath);
  const entries = await backend.listBackups();
  const target = entries.find((entry) => entry.key === key);

  if (!target) {
    return { success: false as const, error: "Backup not found in storage." };
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const preRestoreBackup = `vibebasket-pre-restore-${timestamp}.db`;

  await backend.createBackup(dbPath, preRestoreBackup);

  const tempPath = `${dbPath}.restore-${timestamp}.tmp`;

  try {
    await backend.downloadBackup(key, tempPath);
    await fs.promises.rename(tempPath, dbPath);
  } finally {
    try {
      await fs.promises.unlink(tempPath);
    } catch {}
  }

  return {
    success: true as const,
    message: `Database restored from "${key}". Pre-restore safety backup created as "${preRestoreBackup}".`,
  };
}

export async function runGetStorageConfig() {
  const { getAllBackendsStatus, getStorageBackendInfo, loadScheduleConfig, loadStorageConfig } =
    await loadStorageRuntime();
  try {
    await maybeRunScheduledBackup();
  } catch (error) {
    console.error("Scheduled backup check failed:", error);
  }
  const config = await loadStorageConfig();
  const schedule = await loadScheduleConfig();
  const backends: BackendStatus[] = await getAllBackendsStatus();
  const backendInfo = await getStorageBackendInfo();

  return {
    success: true as const,
    config: config
      ? {
          backend: config.backend,
          hasS3: Boolean(config.s3),
          hasAzure: Boolean(config.azure),
          hasGcs: Boolean(config.gcs),
          schedule: schedule ?? undefined,
        }
      : null,
    schedule: schedule ?? null,
    backends,
    backendInfo,
  };
}

export async function runSaveStorageConfig(backend: string, credentials: Record<string, string>) {
  const { loadStorageConfig, saveStorageConfig } = await loadStorageRuntime();
  const existingConfig = await loadStorageConfig();
  const config: Omit<StorageConfig, "backend"> = {};

  if (backend === "s3" || backend === "r2" || backend === "spaces") {
    config.s3 = {
      endpoint: credentials.endpoint ?? "",
      region: credentials.region ?? "auto",
      bucket: credentials.bucket ?? "",
      accessKey: credentials.accessKey ?? "",
      secretKey: credentials.secretKey ?? "",
    };
  } else if (backend === "azure") {
    config.azure = {
      connectionString: credentials.connectionString ?? "",
      container: credentials.container ?? "",
    };
  } else if (backend === "gcs") {
    config.gcs = {
      bucket: credentials.bucket ?? "",
      projectId: credentials.projectId ?? "",
    };
  }

  if (existingConfig?.schedule) {
    config.schedule = existingConfig.schedule;
  }

  await saveStorageConfig(backend as StorageConfig["backend"], config);
  return { success: true as const };
}

export async function runRemoveStorageConfig() {
  const { deleteStorageConfig } = await loadStorageRuntime();
  await deleteStorageConfig();
  return { success: true as const };
}

export async function runSaveSchedule(enabled: boolean, intervalHours: number) {
  const { loadStorageConfig, saveStorageConfig } = await loadStorageRuntime();
  const config = await loadStorageConfig();
  if (!config) {
    return { success: false as const, error: "No storage config exists." };
  }

  await saveStorageConfig(config.backend, {
    s3: config.s3,
    azure: config.azure,
    gcs: config.gcs,
    schedule: {
      enabled,
      intervalHours: Math.max(1, Math.floor(intervalHours)),
      lastScheduledAt: config.schedule?.lastScheduledAt,
    },
  });

  return { success: true as const };
}

export async function runGetReleaseReadiness() {
  const { getStorageBackendInfo } = await loadStorageRuntime();
  const backendInfo = await getStorageBackendInfo();
  return {
    success: true as const,
    report: buildReleaseReadinessReport(process.env, backendInfo),
  };
}
