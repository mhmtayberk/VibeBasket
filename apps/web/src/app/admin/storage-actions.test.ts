import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/admin-session", () => ({
  requireAdminRole: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const storageMocks = vi.hoisted(() => ({
  createStorageBackend: vi.fn(),
  getStorageBackendInfo: vi.fn(),
  getAllBackendsStatus: vi.fn(),
  loadStorageConfig: vi.fn(),
  saveStorageConfig: vi.fn(),
  deleteStorageConfig: vi.fn(),
  loadScheduleConfig: vi.fn(),
  isScheduleDue: vi.fn(),
  markScheduleComplete: vi.fn(),
}));

vi.mock("@/lib/storage", () => storageMocks);

vi.mock("@/lib/site-config", () => ({
  deleteSiteConfig: vi.fn(),
  getAdminEmails: vi.fn(),
  setSiteConfig: vi.fn(),
}));

const { requireAdminRole } = await import("@/lib/admin-session");
const { revalidatePath } = await import("next/cache");
const { loadStorageConfig, saveStorageConfig } = await import("@/lib/storage");
const { saveStorageConfigAction } = await import("./actions");

describe("saveStorageConfigAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdminRole).mockResolvedValue({ id: "admin", role: "admin" } as never);
    vi.mocked(loadStorageConfig).mockResolvedValue({
      backend: "local",
      schedule: {
        enabled: true,
        intervalHours: 12,
        lastScheduledAt: "2026-06-13T12:00:00.000Z",
      },
    });
    vi.mocked(saveStorageConfig).mockResolvedValue();
  });

  it("preserves the existing backup schedule when saving backend credentials", async () => {
    const result = await saveStorageConfigAction("s3", {
      endpoint: "https://s3.amazonaws.com",
      region: "us-east-1",
      bucket: "vibebasket",
      accessKey: "ak",
      secretKey: "sk",
    });

    expect(result).toEqual({ success: true });
    expect(saveStorageConfig).toHaveBeenCalledWith("s3", {
      s3: {
        endpoint: "https://s3.amazonaws.com",
        region: "us-east-1",
        bucket: "vibebasket",
        accessKey: "ak",
        secretKey: "sk",
      },
      schedule: {
        enabled: true,
        intervalHours: 12,
        lastScheduledAt: "2026-06-13T12:00:00.000Z",
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("saves backend credentials without schedule metadata when no schedule exists yet", async () => {
    vi.mocked(loadStorageConfig).mockResolvedValue({
      backend: "local",
    });

    await saveStorageConfigAction("gcs", {
      bucket: "vibebasket",
      projectId: "vb-prod",
    });

    expect(saveStorageConfig).toHaveBeenCalledWith("gcs", {
      gcs: {
        bucket: "vibebasket",
        projectId: "vb-prod",
      },
    });
  });
});
