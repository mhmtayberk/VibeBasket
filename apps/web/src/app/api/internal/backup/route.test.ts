import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const runScheduledBackupJobMock = vi.fn();
const checkRateLimitMock = vi.fn();
const getClientAddressMock = vi.fn();

vi.mock("@/lib/admin-backup-ops", () => ({
  runScheduledBackupJob: runScheduledBackupJobMock,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: checkRateLimitMock,
  getClientAddress: getClientAddressMock,
}));

describe("/api/internal/backup", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.BACKUP_JOB_TOKEN = "backup-token";
    getClientAddressMock.mockReturnValue("127.0.0.1");
    checkRateLimitMock.mockReturnValue({
      allowed: true,
      remaining: 9,
      resetAt: Date.now() + 60_000,
      retryAfterSeconds: 0,
    });
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

  it("accepts a bearer token", async () => {
    runScheduledBackupJobMock.mockResolvedValueOnce({
      success: true,
      triggered: true,
      reason: "due",
    });
    const { POST } = await import("./route");

    const response = await POST(
      new NextRequest("http://localhost:3000/api/internal/backup", {
        method: "POST",
        headers: {
          authorization: "Bearer backup-token",
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(runScheduledBackupJobMock).toHaveBeenCalledWith({ force: false });
  });

  it("rate limits repeated calls before auth evaluation", async () => {
    checkRateLimitMock.mockReturnValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60_000,
      retryAfterSeconds: 60,
    });
    const { POST } = await import("./route");

    const response = await POST(
      new NextRequest("http://localhost:3000/api/internal/backup", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(429);
    expect(runScheduledBackupJobMock).not.toHaveBeenCalled();
    expect(response.headers.get("Retry-After")).toBe("60");
  });
});
