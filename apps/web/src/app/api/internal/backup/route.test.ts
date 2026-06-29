import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const runScheduledBackupJobMock = vi.fn();

vi.mock("@/lib/admin-backup-ops", () => ({
  runScheduledBackupJob: runScheduledBackupJobMock,
}));

describe("/api/internal/backup", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.BACKUP_JOB_TOKEN = "backup-token";
  });

  it("rejects requests without the backup job token", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new NextRequest("http://localhost:3000/api/internal/backup", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Unauthorized",
    });
  });

  it("runs the scheduled backup job when the token is valid", async () => {
    runScheduledBackupJobMock.mockResolvedValueOnce({
      success: true,
      triggered: true,
      reason: "due",
    });
    const { POST } = await import("./route");

    const response = await POST(
      new NextRequest("http://localhost:3000/api/internal/backup?force=1", {
        method: "POST",
        headers: {
          "x-vibebasket-backup-token": "backup-token",
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(runScheduledBackupJobMock).toHaveBeenCalledWith({ force: true });
  });
});
