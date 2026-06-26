import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdminRoleMock = vi.fn();
const requireAdminMutationMock = vi.fn();
const runListBackupsMock = vi.fn();
const runBackupDatabaseMock = vi.fn();
const runDeleteBackupMock = vi.fn();
const runRestoreBackupMock = vi.fn();

vi.mock("@/lib/admin-session", () => ({
  ForbiddenError: class ForbiddenError extends Error {},
  createAdminForbiddenResponse: (error: unknown) => {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    return null;
  },
  requireAdminRole: requireAdminRoleMock,
  requireAdminMutation: requireAdminMutationMock,
}));

vi.mock("@/lib/admin-backup-ops", () => ({
  runListBackups: runListBackupsMock,
  runBackupDatabase: runBackupDatabaseMock,
  runDeleteBackup: runDeleteBackupMock,
  runRestoreBackup: runRestoreBackupMock,
}));

describe("/api/admin/backup", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("rejects backup creation when mutation guard fails", async () => {
    requireAdminMutationMock.mockRejectedValueOnce(new Error("forbidden"));
    const { POST } = await import("./route");

    const response = await POST(
      new NextRequest("http://localhost:3000/api/admin/backup", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Forbidden",
    });
  });

  it("rejects backup listing when admin role guard fails", async () => {
    requireAdminRoleMock.mockRejectedValueOnce(new Error("forbidden"));
    const { GET } = await import("./route");

    const response = await GET();

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Forbidden",
    });
  });

  it("allows restore when mutation guard passes", async () => {
    requireAdminMutationMock.mockResolvedValueOnce({ id: "admin" });
    runRestoreBackupMock.mockResolvedValueOnce({ success: true });
    const { POST } = await import("./restore/route");

    const response = await POST(
      new NextRequest("http://localhost:3000/api/admin/backup/restore", {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
        },
        body: JSON.stringify({ key: "backup.db" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(runRestoreBackupMock).toHaveBeenCalledWith("backup.db");
  });
});
