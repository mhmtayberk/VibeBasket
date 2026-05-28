import { eq } from "drizzle-orm";
import { db, backupStorageConfig } from "@vibebasket/core";
import { sealConfig, unsealConfig } from "./crypto";
import type { StorageBackendId } from "./types";
import { STORAGE_BACKEND_OPTIONS } from "./factory";

export interface StorageConfig {
	backend: StorageBackendId;
	s3?: {
		endpoint: string;
		region: string;
		bucket: string;
		accessKey: string;
		secretKey: string;
	};
	azure?: {
		connectionString: string;
		container: string;
	};
	gcs?: {
		bucket: string;
		projectId: string;
	};
	schedule?: {
		enabled: boolean;
		intervalHours: number;
		lastScheduledAt?: string;
	};
}

export async function loadStorageConfig(): Promise<StorageConfig | null> {
	const rows = await db
		.select()
		.from(backupStorageConfig)
		.where(eq(backupStorageConfig.id, "default"))
		.limit(1);

	const row = rows[0];
	if (!row || !row.encryptedConfig) return null;

	const config = unsealConfig<StorageConfig>(row.encryptedConfig);
	if (!config) return null;

	return {
		backend: (row.backend as StorageBackendId) || "local",
		s3: config.s3,
		azure: config.azure,
		gcs: config.gcs,
	};
}

export async function saveStorageConfig(
	backendId: StorageBackendId,
	config: Omit<StorageConfig, "backend">,
): Promise<void> {
	const encryptedConfig = sealConfig(config as Record<string, unknown>);

	await db
		.insert(backupStorageConfig)
		.values({
			id: "default",
			backend: backendId,
			encryptedConfig,
			updatedAt: new Date(),
		})
		.onConflictDoUpdate({
			target: backupStorageConfig.id,
			set: {
				backend: backendId,
				encryptedConfig,
				updatedAt: new Date(),
			},
		});
}

export async function deleteStorageConfig(): Promise<void> {
	await db
		.delete(backupStorageConfig)
		.where(eq(backupStorageConfig.id, "default"));
}

export async function resolveBackendId(): Promise<StorageBackendId> {
	try {
		const dbConfig = await loadStorageConfig();
		if (dbConfig?.backend) return dbConfig.backend;
	} catch {
		// DB not available, fall through to env vars
	}

	const envBackend = (process.env.BACKUP_STORAGE_BACKEND ?? "").trim();
	if (
		STORAGE_BACKEND_OPTIONS.some((opt) => opt.id === envBackend)
	) {
		return envBackend as StorageBackendId;
	}

	return "local";
}

export async function loadScheduleConfig(): Promise<{
	enabled: boolean;
	intervalHours: number;
	lastScheduledAt: string | null;
} | null> {
	const config = await loadStorageConfig();
	return config?.schedule
		? {
				enabled: config.schedule.enabled,
				intervalHours: config.schedule.intervalHours || 24,
				lastScheduledAt: config.schedule.lastScheduledAt ?? null,
			}
		: null;
}

export async function isScheduleDue(): Promise<boolean> {
	const schedule = await loadScheduleConfig();
	if (!schedule?.enabled || !schedule.intervalHours) return false;

	const lastAt = schedule.lastScheduledAt
		? new Date(schedule.lastScheduledAt).getTime()
		: 0;
	const intervalMs = schedule.intervalHours * 60 * 60 * 1000;

	return Date.now() - lastAt >= intervalMs;
}

export async function markScheduleComplete(): Promise<void> {
	const config = await loadStorageConfig();
	if (!config) return;

	await saveStorageConfig(config.backend, {
		s3: config.s3,
		azure: config.azure,
		gcs: config.gcs,
		schedule: {
			enabled: config.schedule?.enabled ?? false,
			intervalHours: config.schedule?.intervalHours ?? 24,
			lastScheduledAt: new Date().toISOString(),
		},
	});
}
