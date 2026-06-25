import { beforeEach, describe, expect, it, vi } from "vitest";

const createBackupMock = vi.fn();
const createStorageBackendMock = vi.fn();
const getAllBackendsStatusMock = vi.fn();
const getStorageBackendInfoMock = vi.fn();
const isScheduleDueMock = vi.fn();
const loadScheduleConfigMock = vi.fn();
const loadStorageConfigMock = vi.fn();
const markScheduleCompleteMock = vi.fn();

vi.mock("@/lib/storage", () => ({
  createStorageBackend: createStorageBackendMock,
  getAllBackendsStatus: getAllBackendsStatusMock,
  getStorageBackendInfo: getStorageBackendInfoMock,
  isScheduleDue: isScheduleDueMock,
  loadScheduleConfig: loadScheduleConfigMock,
  loadStorageConfig: loadStorageConfigMock,
  markScheduleComplete: markScheduleCompleteMock,
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
  });

  it("runs a scheduled backup before returning storage config when due", async () => {
    isScheduleDueMock.mockResolvedValueOnce(true);
    loadStorageConfigMock.mockResolvedValueOnce({ backend: "s3" });
    loadScheduleConfigMock.mockResolvedValueOnce({
      enabled: true,
      intervalHours: 24,
      lastScheduledAt: null,
    });

    const { runGetStorageConfig } = await import("./admin-backup-ops");
    const result = await runGetStorageConfig();

    expect(result.success).toBe(true);
    expect(createBackupMock).toHaveBeenCalledTimes(1);
    expect(markScheduleCompleteMock).toHaveBeenCalledTimes(1);
  });

  it("does not mark schedule complete when the scheduled backup fails", async () => {
    isScheduleDueMock.mockResolvedValueOnce(true);
    createBackupMock.mockRejectedValueOnce(new Error("backup failed"));
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { runGetStorageConfig } = await import("./admin-backup-ops");
    const result = await runGetStorageConfig();

    expect(result.success).toBe(true);
    expect(markScheduleCompleteMock).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
