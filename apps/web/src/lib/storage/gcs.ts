import fs from "node:fs";
import type { BackupEntry, CreateBackupResult, StorageBackend, StorageBackendId } from "./types";

interface GcsConfig {
	bucket: string;
	projectId: string;
}

export class GcsStorageBackend implements StorageBackend {
	readonly id: StorageBackendId = "gcs";
	readonly label = "Google Cloud Storage";
	readonly isConfigured: boolean;
	private config: GcsConfig;

	constructor(config: GcsConfig) {
		this.config = config;
		this.isConfigured = Boolean(config.bucket && config.projectId);
	}

	private async getBucket() {
		const { Storage } = await import("@google-cloud/storage");
		const storage = new Storage({ projectId: this.config.projectId });
		return storage.bucket(this.config.bucket);
	}

	async createBackup(
		localPath: string,
		key: string,
	): Promise<CreateBackupResult> {
		const bucket = await this.getBucket();
		const stat = await fs.promises.stat(localPath);

		await bucket.upload(localPath, { destination: key });

		return {
			key,
			sizeBytes: stat.size,
			location: `gs://${this.config.bucket}/${key}`,
		};
	}

	async listBackups(): Promise<BackupEntry[]> {
		try {
			const bucket = await this.getBucket();
			const [files] = await bucket.getFiles();
			return files
				.map((file) => ({
					key: file.name,
					sizeBytes: Number(file.metadata.size ?? 0),
					lastModified: new Date(file.metadata.updated ?? Date.now()),
				}))
				.sort(
					(a, b) =>
						b.lastModified.getTime() - a.lastModified.getTime(),
				);
		} catch {
			return [];
		}
	}

	async deleteBackup(key: string): Promise<void> {
		const bucket = await this.getBucket();
		await bucket.file(key).delete();
	}
}
