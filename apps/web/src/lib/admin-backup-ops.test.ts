import { beforeEach, describe, expect, it, vi } from "vitest";

const createBackupMock = vi.fn();
const createStorageBackendMock = vi.fn();
const getAllBackendsStatusMock = vi.fn();
const getStorageBackendInfoMock = vi.fn();
const isScheduleDueMock = vi.fn();
const loadScheduleConfigMock = vi.fn();
const loadStorageConfigMock = vi.fn();
const markScheduleCompleteMock = vi.fn();
const getBackupRuntimeStatusMock = vi.fn();
const setBackupRuntimeStatusMock = vi.fn();

vi.mock("@/lib/storage", () => ({
  createStorageBackend: createStorageBackendMock,
  getAllBackendsStatus: getAllBackendsStatusMock,
  getStorageBackendInfo: getStorageBackendInfoMock,
  isScheduleDue: isScheduleDueMock,
  loadScheduleConfig: loadScheduleConfigMock,
  loadStorageConfig: loadStorageConfigMock,
  markScheduleComplete: markScheduleCompleteMock,
}));

vi.mock("@/lib/backup-runtime-status", () => ({
  getBackupRuntimeStatus: getBackupRuntimeStatusMock,
  setBackupRuntimeStatus: setBackupRuntimeStatusMock,
}));

describe("admin backup ops", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.DATABASE_URL = "file:test.db";
    createStorageBackendMock.mockResolvedValue({
      id: "s3",
      label: "AWS S3",
      createBackup: createBackupMock,
    });
    createBackupMock.mockResolvedValue({
      key: "backup.db",
      sizeBytes: 123,
      location: "s3://bucket/backup.db",
    });
    isScheduleDueMock.mockResolvedValue(false);
    loadStorageConfigMock.mockResolvedValue(null);
    loadScheduleConfigMock.mockResolvedValue(null);
    getAllBackendsStatusMock.mockResolvedValue([]);
    getStorageBackendInfoMock.mockResolvedValue({
      id: "s3",
      configuredId: "s3",
      isConfigured: true,
      isFallback: false,
      warning: null,
    });
    markScheduleCompleteMock.mockResolvedValue(undefined);
    getBackupRuntimeStatusMock.mockResolvedValue({
      lastAttemptAt: null,
      lastSuccessAt: null,
      lastFailureAt: null,
      lastError: null,
      lastBackupKey: null,
      lastBackupSizeBytes: null,
      lastStorageLabel: null,
    });
    setBackupRuntimeStatusMock.mockResolvedValue(undefined);
  });

  it("runs a scheduled backup job when due", async () => {
    isScheduleDueMock.mockResolvedValueOnce(true);
    loadScheduleConfigMock.mockResolvedValueOnce({
      enabled: true,
      intervalHours: 24,
      lastScheduledAt: null,
    });

    const { runScheduledBackupJob } = await import("./admin-backup-ops");
    const result = await runScheduledBackupJob();

    expect(result.success).toBe(true);
    expect(result.triggered).toBe(true);
    expect(createBackupMock).toHaveBeenCalledTimes(1);
    expect(markScheduleCompleteMock).toHaveBeenCalledTimes(1);
  });

  it("does not mark schedule complete when the scheduled backup fails", async () => {
    isScheduleDueMock.mockResolvedValueOnce(true);
    loadScheduleConfigMock.mockResolvedValueOnce({
      enabled: true,
      intervalHours: 24,
      lastScheduledAt: null,
    });
    createBackupMock.mockRejectedValueOnce(new Error("backup failed"));

    const { runScheduledBackupJob } = await import("./admin-backup-ops");

    await expect(runScheduledBackupJob()).rejects.toThrow("backup failed");
    expect(markScheduleCompleteMock).not.toHaveBeenCalled();
  });

  it("returns runtime status with storage config without triggering backups", async () => {
    const runtimeStatus = {
      lastAttemptAt: "2026-06-29T10:00:00.000Z",
      lastSuccessAt: "2026-06-29T10:00:00.000Z",
      lastFailureAt: null,
      lastError: null,
      lastBackupKey: "backup.db",
      lastBackupSizeBytes: 123,
      lastStorageLabel: "AWS S3",
    };
    getBackupRuntimeStatusMock.mockResolvedValueOnce(runtimeStatus);

    const { runGetStorageConfig } = await import("./admin-backup-ops");
    const result = await runGetStorageConfig();

    expect(result.success).toBe(true);
    expect(result.runtimeStatus).toEqual(runtimeStatus);
    expect(createBackupMock).not.toHaveBeenCalled();
  });
});
