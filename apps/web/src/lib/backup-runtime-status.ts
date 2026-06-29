import { getSiteConfig, setSiteConfig } from "./site-config";

const BACKUP_RUNTIME_STATUS_KEY = "backup_runtime_status";

export interface BackupRuntimeStatus {
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastError: string | null;
  lastBackupKey: string | null;
  lastBackupSizeBytes: number | null;
  lastStorageLabel: string | null;
}

export const EMPTY_BACKUP_RUNTIME_STATUS: BackupRuntimeStatus = {
  lastAttemptAt: null,
  lastSuccessAt: null,
  lastFailureAt: null,
  lastError: null,
  lastBackupKey: null,
  lastBackupSizeBytes: null,
  lastStorageLabel: null,
};

function isBackupRuntimeStatus(value: unknown): value is BackupRuntimeStatus {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    ("lastAttemptAt" in candidate ||
      "lastSuccessAt" in candidate ||
      "lastFailureAt" in candidate) &&
    (candidate.lastBackupSizeBytes === null || typeof candidate.lastBackupSizeBytes === "number")
  );
}

export async function getBackupRuntimeStatus(): Promise<BackupRuntimeStatus> {
  const raw = await getSiteConfig(BACKUP_RUNTIME_STATUS_KEY);
  if (!raw) {
    return { ...EMPTY_BACKUP_RUNTIME_STATUS };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isBackupRuntimeStatus(parsed)) {
      return { ...EMPTY_BACKUP_RUNTIME_STATUS };
    }

    return {
      ...EMPTY_BACKUP_RUNTIME_STATUS,
      ...parsed,
    };
  } catch {
    return { ...EMPTY_BACKUP_RUNTIME_STATUS };
  }
}

export async function setBackupRuntimeStatus(
  partial: Partial<BackupRuntimeStatus>,
): Promise<BackupRuntimeStatus> {
  const next = {
    ...(await getBackupRuntimeStatus()),
    ...partial,
  };
  await setSiteConfig(BACKUP_RUNTIME_STATUS_KEY, JSON.stringify(next));
  return next;
}
