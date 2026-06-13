"use server";

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "@/lib/admin-session";
import {
  createStorageBackend,
  getStorageBackendInfo,
  getAllBackendsStatus,
  loadStorageConfig,
  saveStorageConfig,
  deleteStorageConfig,
  loadScheduleConfig,
  isScheduleDue,
  markScheduleComplete,
  type BackupEntry,
  type BackendStatus,
  type StorageConfig,
} from "@/lib/storage";
import { deleteSiteConfig, getAdminEmails, setSiteConfig } from "@/lib/site-config";
import { cleanupStaleData } from "@/lib/data-cleanup";
import { db, catalogItems, bundles, users, savedStacks } from "@vibebasket/core";
import { eq, sql } from "drizzle-orm";

export async function triggerSyncAction() {
  await requireAdminRole();

  try {
    const { RegistrySyncService } = await import("@vibebasket/registry");
    const syncService = new RegistrySyncService();
    const started = Date.now();
    const summary = await syncService.syncAll();
    const durationMs = Date.now() - started;

    revalidatePath("/admin");

    return {
      success: true,
      summary: {
        totalItems: summary.totalItems ?? 0,
        mcps: summary.mcps?.added ?? 0,
        skills: summary.skills?.added ?? 0,
        durationMs,
        sourceErrorsCount: summary.sourceErrors?.length ?? 0,
      },
    };
  } catch (error: unknown) {
    console.error("Failed to run manual admin sync:", error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "An unexpected error occurred during synchronization";
    return {
      success: false,
      error: message,
    };
  }
}

function resolveDatabaseFilePath(): string {
  const url = process.env.DATABASE_URL ?? "file:vibebasket.db";

  if (url.startsWith("file:")) {
    return url.slice(5);
  }

  return url;
}

export async function getBackupStorageInfo() {
  await requireAdminRole();

  try {
    const info = await getStorageBackendInfo();
    const backends: BackendStatus[] = getAllBackendsStatus();

    return { success: true, info, backends };
  } catch (error: unknown) {
    console.error("Failed to get storage info:", error);
    return { success: false, info: null, backends: [] };
  }
}

export async function backupDatabaseAction() {
  await requireAdminRole();

  try {
    const backend = await createStorageBackend();
    const dbPath = path.resolve(resolveDatabaseFilePath());

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const key = `vibebasket-backup-${timestamp}.db`;

    let result: { key: string; sizeBytes: number; location?: string };

    if (backend.id === "local") {
      const backupDir = path.resolve(
        process.env.BACKUP_LOCAL_DIR ?? path.join(process.cwd(), "backups"),
      );
      await fs.promises.mkdir(backupDir, { recursive: true });
      const safeKey = path.basename(key).replace(/[^a-zA-Z0-9._-]/g, "_");
      const destPath = path.join(backupDir, safeKey);

      // Atomic backup using SQLite VACUUM INTO
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
  await requireAdminRole();

  try {
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
  await requireAdminRole();

  try {
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
  await requireAdminRole();

  try {
    const backend = await createStorageBackend();
    const dbPath = path.resolve(resolveDatabaseFilePath());
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
      const safeKey = path.basename(key).replace(/[^a-zA-Z0-9._-]/g, "_");
      if (backend.id === "local") {
        const backupPath = path.join(
          process.env.BACKUP_LOCAL_DIR ?? path.join(process.cwd(), "backups"),
          safeKey,
        );
        await fs.promises.copyFile(backupPath, tempPath);
      } else {
        // For cloud backends, listBackups only returns metadata
        // Full restore from cloud is limited without download support
        return {
          success: false,
          error:
            "Restore from cloud storage is not yet supported. Download the backup file manually.",
        };
      }

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
  await requireAdminRole();

  try {
    const config = await loadStorageConfig();
    const schedule = await loadScheduleConfig();
    const backends = getAllBackendsStatus();

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
  await requireAdminRole();

  try {
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
  await requireAdminRole();

  try {
    await deleteStorageConfig();
    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to remove storage config:", error);
    return { success: false, error: "Failed to remove configuration" };
  }
}

export async function saveScheduleAction(enabled: boolean, intervalHours: number) {
  await requireAdminRole();

  try {
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

export async function checkScheduledBackupAction() {
  await requireAdminRole();

  try {
    const due = await isScheduleDue();
    return { success: true, due };
  } catch {
    return { success: true, due: false };
  }
}

export async function triggerScheduledBackupAction() {
  await requireAdminRole();

  try {
    const due = await isScheduleDue();
    if (!due) {
      return { success: true, triggered: false, message: "Not yet due." };
    }

    const dbPath = (process.env.DATABASE_URL ?? "file:vibebasket.db").startsWith("file:")
      ? (process.env.DATABASE_URL ?? "file:vibebasket.db").slice(5)
      : "vibebasket.db";

    const path = await import("node:path");
    const fs = await import("node:fs");

    const backend = await createStorageBackend();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const key = `vibebasket-scheduled-${timestamp}.db`;

    const result = await backend.createBackup(path.resolve(dbPath), key);
    await markScheduleComplete();

    return {
      success: true,
      triggered: true,
      backup: { key: result.key, sizeBytes: result.sizeBytes, storageLabel: backend.label },
    };
  } catch (error: unknown) {
    console.error("Scheduled backup failed:", error);
    return {
      success: false,
      triggered: false,
      error: error instanceof Error ? error.message : "Failed",
    };
  }
}

export async function getAdminEmailsAction() {
  await requireAdminRole();
  try {
    const emails = await getAdminEmails();
    return { success: true, emails: emails.join(", ") };
  } catch {
    return { success: true, emails: "" };
  }
}

export async function saveAdminEmailsAction(emails: string) {
	await requireAdminRole();
	try {
		const trimmed = emails.trim();
		if (trimmed) {
			await setSiteConfig("admin_emails", trimmed);
		} else {
			await deleteSiteConfig("admin_emails");
		}
		revalidatePath("/admin");
		return { success: true };
	} catch (error: unknown) {
		return { success: false, error: error instanceof Error ? error.message : "Failed" };
	}
}

export async function getFts5HealthAction() {
	await requireAdminRole();
	try {
		const [catalogCount, ftsCount] = await Promise.all([
			db.select({ count: sql<number>`count(*)` }).from(catalogItems),
			db.all<{ cnt: number }>(sql`SELECT count(*) as cnt FROM catalog_items_fts`),
		]);
		const total = Number(catalogCount[0]?.count ?? 0);
		const ftsTotal = ftsCount[0]?.cnt ?? 0;
		const healthy = total === ftsTotal;
		return { success: true, healthy, catalogRows: total, ftsRows: ftsTotal };
	} catch (error: unknown) {
		return { success: false, error: error instanceof Error ? error.message : "Failed" };
	}
}

export async function rebuildFts5Action() {
	await requireAdminRole();
	try {
		await db.run(sql`INSERT INTO catalog_items_fts(catalog_items_fts) VALUES('rebuild')`);
		revalidatePath("/admin");
		return { success: true };
	} catch (error: unknown) {
		return { success: false, error: error instanceof Error ? error.message : "Failed" };
	}
}

export async function getDbHealthAction() {
	await requireAdminRole();
	try {
		const tableCounts = await Promise.all([
			db.select({ count: sql<number>`count(*)` }).from(catalogItems),
			db.select({ count: sql<number>`count(*)` }).from(bundles),
			db.select({ count: sql<number>`count(*)` }).from(users),
			db.select({ count: sql<number>`count(*)` }).from(savedStacks),
		]);
		const integrity = await db.all<{ ok: string }>(sql`PRAGMA integrity_check`);

		return {
			success: true,
			catalogItems: Number(tableCounts[0][0]?.count ?? 0),
			bundles: Number(tableCounts[1][0]?.count ?? 0),
			users: Number(tableCounts[2][0]?.count ?? 0),
			savedStacks: Number(tableCounts[3][0]?.count ?? 0),
			integrityOk: integrity[0]?.ok === "ok",
		};
	} catch (error: unknown) {
		return { success: false, error: error instanceof Error ? error.message : "Failed" };
	}
}

export async function forceCleanupAction() {
	await requireAdminRole();
	try {
		await cleanupStaleData(true);
		revalidatePath("/admin");
		return { success: true };
	} catch (error: unknown) {
		return { success: false, error: error instanceof Error ? error.message : "Failed" };
	}
}

export async function getUserOverviewAction() {
	await requireAdminRole();
	try {
		const [totalUsers, recentUsers, totalStacks] = await Promise.all([
			db.select({ count: sql<number>`count(*)` }).from(users),
			db.select({ count: sql<number>`count(*)` }).from(users).where(
				sql`${users.createdAt} > ${Math.floor(Date.now() / 1000) - 86400 * 7}`
			),
			db.select({ count: sql<number>`count(*)` }).from(savedStacks),
		]);

		return {
			success: true,
			totalUsers: Number(totalUsers[0]?.count ?? 0),
			recentUsers: Number(recentUsers[0]?.count ?? 0),
			totalStacks: Number(totalStacks[0]?.count ?? 0),
		};
	} catch (error: unknown) {
		return { success: false, error: error instanceof Error ? error.message : "Failed" };
	}
}
