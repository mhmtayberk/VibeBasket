export type StorageBackendId = "local" | "s3" | "r2" | "spaces" | "azure" | "gcs";

export interface BackupEntry {
	key: string;
	sizeBytes: number;
	lastModified: Date;
}

export interface CreateBackupResult {
	key: string;
	sizeBytes: number;
	location?: string;
}

export interface StorageBackendConfig {
	local: { backupsDir?: string };
	s3: {
		endpoint: string;
		region: string;
		bucket: string;
		accessKey: string;
		secretKey: string;
	};
	r2: {
		endpoint: string;
		accountId: string;
		bucket: string;
		accessKey: string;
		secretKey: string;
	};
	spaces: {
		endpoint: string;
		region: string;
		bucket: string;
		accessKey: string;
		secretKey: string;
	};
	azure: {
		connectionString: string;
		container: string;
	};
	gcs: {
		bucket: string;
		projectId: string;
	};
}

export interface StorageBackend {
	readonly id: StorageBackendId;
	readonly label: string;
	readonly isConfigured: boolean;
	createBackup(
		localPath: string,
		key: string,
	): Promise<CreateBackupResult>;
	listBackups(): Promise<BackupEntry[]>;
	deleteBackup(key: string): Promise<void>;
}
