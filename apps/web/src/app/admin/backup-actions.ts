"use server";

import fs from "node:fs";
import path from "node:path";
import type { BackendStatus, BackupEntry, StorageConfig } from "@/lib/storage";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const { requireAdminRole } = await import("@/lib/admin-session");
  return requireAdminRole();
}

async function loadStorageRuntime() {
  return import("@/lib/storage");
}

function resolveDatabaseFilePath(): string | null {
  const url = process.env.DATABASE_URL ?? "file:vibebasket.db";

  if (url.startsWith("file:")) {
    return url.slice(5);
  }

  return null;
}

export async function backupDatabaseAction() {
  await requireAdmin();

  try {
    const { createStorageBackend } = await loadStorageRuntime();
    const backend = await createStorageBackend();
    const resolvedDbPath = resolveDatabaseFilePath();
    if (!resolvedDbPath) {
      return {
        success: false,
        error: "Backups currently require a local SQLite file DATABASE_URL (file:...).",
      };
    }
    const dbPath = path.resolve(resolvedDbPath);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const key = `vibebasket-backup-${timestamp}.db`;

    let result: { key: string; sizeBytes: number; location?: string };

    if (backend.id === "local") {
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

    revalidatePath("/admin");

    return {
      success: true,
      backup: {
        key: result.key,
        sizeBytes: result.sizeBytes,
        location: result.location ?? "",
        storageLabel: backend.label,
        createdAt: new Date().toISOString(),
      },
    };
  } catch (error: unknown) {
    console.error("Failed to backup database:", error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "An unexpected error occurred during backup";
    return {
      success: false,
      error: message,
    };
  }
}

export async function listBackupsAction() {
  await requireAdmin();

  try {
    const { createStorageBackend } = await loadStorageRuntime();
    const backend = await createStorageBackend();
    const entries = await backend.listBackups();

    const backups: BackupEntry[] = entries.map((entry) => ({
      key: entry.key,
      sizeBytes: entry.sizeBytes,
      lastModified: entry.lastModified,
    }));

    return {
      success: true,
      backups,
      storageLabel: backend.label,
    };
  } catch (error: unknown) {
    console.error("Failed to list backups:", error);
    return { success: false, backups: [], storageLabel: "" };
  }
}

export async function deleteBackupAction(key: string) {
  await requireAdmin();

  try {
    const { createStorageBackend } = await loadStorageRuntime();
    const backend = await createStorageBackend();
    await backend.deleteBackup(key);

    revalidatePath("/admin");

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to delete backup:", error);
    const message =
      error instanceof Error && error.message ? error.message : "Failed to delete backup";
    return { success: false, error: message };
  }
}

export async function restoreBackupAction(key: string) {
  await requireAdmin();

  try {
    const { createStorageBackend } = await loadStorageRuntime();
    const backend = await createStorageBackend();
    const resolvedDbPath = resolveDatabaseFilePath();
    if (!resolvedDbPath) {
      return {
        success: false,
        error: "Restore currently requires a local SQLite file DATABASE_URL (file:...).",
      };
    }
    const dbPath = path.resolve(resolvedDbPath);
    const entries = await backend.listBackups();
    const target = entries.find((entry) => entry.key === key);

    if (!target) {
      return { success: false, error: "Backup not found in storage." };
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const preRestoreBackup = `vibebasket-pre-restore-${timestamp}.db`;

    await backend.createBackup(dbPath, preRestoreBackup);

    const tempPath = path.join(path.dirname(dbPath), `restore-temp-${timestamp}.db`);

    try {
      await backend.downloadBackup(key, tempPath);
      await fs.promises.rename(tempPath, dbPath);
    } finally {
      try {
        await fs.promises.unlink(tempPath);
      } catch {
        // cleanup best-effort
      }
    }

    revalidatePath("/admin");

    return {
      success: true,
      message: `Database restored from "${key}". Pre-restore safety backup created as "${preRestoreBackup}".`,
    };
  } catch (error: unknown) {
    console.error("Failed to restore backup:", error);
    const message =
      error instanceof Error && error.message ? error.message : "Failed to restore backup";
    return { success: false, error: message };
  }
}

export async function getStorageConfigAction() {
  await requireAdmin();

  try {
    const { getAllBackendsStatus, getStorageBackendInfo, loadScheduleConfig, loadStorageConfig } =
      await loadStorageRuntime();
    const config = await loadStorageConfig();
    const schedule = await loadScheduleConfig();
    const backends: BackendStatus[] = await getAllBackendsStatus();
    const backendInfo = await getStorageBackendInfo();

    return {
      success: true,
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
  } catch (error: unknown) {
    console.error("Failed to get storage config:", error);
    return { success: false, config: null, backends: [] };
  }
}

export async function saveStorageConfigAction(
  backend: string,
  credentials: Record<string, string>,
) {
  await requireAdmin();

  try {
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

    revalidatePath("/admin");

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to save storage config:", error);
    const message =
      error instanceof Error && error.message ? error.message : "Failed to save configuration";
    return { success: false, error: message };
  }
}

export async function removeStorageConfigAction() {
  await requireAdmin();

  try {
    const { deleteStorageConfig } = await loadStorageRuntime();
    await deleteStorageConfig();
    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to remove storage config:", error);
    return { success: false, error: "Failed to remove configuration" };
  }
}

export async function saveScheduleAction(enabled: boolean, intervalHours: number) {
  await requireAdmin();

  try {
    const { loadStorageConfig, saveStorageConfig } = await loadStorageRuntime();
    const config = await loadStorageConfig();
    if (!config) {
      return { success: false, error: "No storage config exists." };
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

    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save schedule.",
    };
  }
}
