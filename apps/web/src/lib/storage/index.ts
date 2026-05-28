export type { BackupEntry, CreateBackupResult, StorageBackend, StorageBackendId } from "./types";
export type { BackendStatus } from "./factory";
export type { StorageConfig } from "./db-config";
export { LocalStorageBackend, resolveLocalBackupDir } from "./local";
export {
	createStorageBackend,
	getStorageBackendInfo,
	getAllBackendsStatus,
	STORAGE_BACKEND_OPTIONS,
} from "./factory";
export {
	loadStorageConfig,
	saveStorageConfig,
	deleteStorageConfig,
	resolveBackendId,
} from "./db-config";
