import fs from "node:fs";
import type { BackupEntry, CreateBackupResult, StorageBackend, StorageBackendId } from "./types";

interface AzureConfig {
	connectionString: string;
	container: string;
}

export class AzureStorageBackend implements StorageBackend {
	readonly id: StorageBackendId = "azure";
	readonly label = "Azure Blob Storage";
	readonly isConfigured: boolean;
	private config: AzureConfig;

	constructor(config: AzureConfig) {
		this.config = config;
		this.isConfigured = Boolean(config.connectionString && config.container);
	}

	private async getContainerClient() {
		const { BlobServiceClient } = await import("@azure/storage-blob");
		const serviceClient =
			BlobServiceClient.fromConnectionString(
				this.config.connectionString,
			);
		return serviceClient.getContainerClient(this.config.container);
	}

	async createBackup(
		localPath: string,
		key: string,
	): Promise<CreateBackupResult> {
		const container = await this.getContainerClient();
		await container.createIfNotExists();
		const blockBlobClient = container.getBlockBlobClient(key);

		const body = await fs.promises.readFile(localPath);
		const stat = await fs.promises.stat(localPath);

		await blockBlobClient.upload(body, body.length);

		return {
			key,
			sizeBytes: stat.size,
			location: `${container.url}/${key}`,
		};
	}

	async listBackups(): Promise<BackupEntry[]> {
		try {
			const container = await this.getContainerClient();
			const results: BackupEntry[] = [];

			for await (const blob of container.listBlobsFlat()) {
				results.push({
					key: blob.name,
					sizeBytes: blob.properties.contentLength ?? 0,
					lastModified: blob.properties.lastModified ?? new Date(0),
				});
			}

			return results.sort(
				(a, b) => b.lastModified.getTime() - a.lastModified.getTime(),
			);
		} catch {
			return [];
		}
	}

	async deleteBackup(key: string): Promise<void> {
		const container = await this.getContainerClient();
		await container.deleteBlob(key);
	}
}
