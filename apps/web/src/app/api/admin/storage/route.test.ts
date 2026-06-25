import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdminRoleMock = vi.fn();
const requireAdminMutationMock = vi.fn();
const runGetStorageConfigMock = vi.fn();
const runSaveStorageConfigMock = vi.fn();
const runSaveScheduleMock = vi.fn();
const runRemoveStorageConfigMock = vi.fn();

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
  runGetStorageConfig: runGetStorageConfigMock,
  runSaveStorageConfig: runSaveStorageConfigMock,
  runSaveSchedule: runSaveScheduleMock,
  runRemoveStorageConfig: runRemoveStorageConfigMock,
}));

describe("/api/admin/storage", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("rejects POST when mutation origin/admin guard fails", async () => {
    requireAdminMutationMock.mockRejectedValueOnce(new Error("forbidden"));
    const { POST } = await import("./route");

    const response = await POST(
      new NextRequest("http://localhost:3000/api/admin/storage", {
        method: "POST",
        body: JSON.stringify({ backend: "s3", credentials: {} }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Forbidden",
    });
  });

  it("applies PATCH when mutation guard passes", async () => {
    requireAdminMutationMock.mockResolvedValueOnce({ id: "admin" });
    runSaveScheduleMock.mockResolvedValueOnce({ success: true });
    const { PATCH } = await import("./route");

    const response = await PATCH(
      new NextRequest("http://localhost:3000/api/admin/storage", {
        method: "PATCH",
        headers: {
          origin: "http://localhost:3000",
        },
        body: JSON.stringify({ enabled: true, intervalHours: 6 }),
      }),
    );

    expect(response.status).toBe(200);
    expect(runSaveScheduleMock).toHaveBeenCalledWith(true, 6);
  });
});
