import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdminRoleMock = vi.fn();
const runGetReleaseReadinessMock = vi.fn();

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
}));

vi.mock("@/lib/admin-backup-ops", () => ({
  runGetReleaseReadiness: runGetReleaseReadinessMock,
}));

describe("/api/admin/release-readiness", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("rejects GET when admin role guard fails", async () => {
    requireAdminRoleMock.mockRejectedValueOnce(new Error("forbidden"));
    const { GET } = await import("./route");

    const response = await GET();

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Forbidden",
    });
  });

  it("returns the release readiness payload for admins", async () => {
    requireAdminRoleMock.mockResolvedValueOnce({ id: "admin" });
    runGetReleaseReadinessMock.mockResolvedValueOnce({ success: true, checks: [] });
    const { GET } = await import("./route");

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, checks: [] });
  });
});
