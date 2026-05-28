import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAdminRole, ForbiddenError } from "@/lib/admin-session";

vi.mock("@/lib/admin-session", () => ({
  ForbiddenError: class ForbiddenError extends Error {
    constructor() {
      super("Forbidden");
      this.name = "ForbiddenError";
    }
  },
  requireAdminRole: vi.fn(),
}));

vi.mock("@vibebasket/core", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        groupBy: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue([]),
          })),
        })),
        orderBy: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([]),
        })),
      })),
    })),
  },
  users: {},
  savedStacks: {},
  savedStackItems: {},
  catalogSyncRuns: {},
  catalogItems: {},
}));

describe("GET /api/admin/stats", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mocked(requireAdminRole).mockReset();
  });

  it("returns 403 when session is not admin or email is unverified", async () => {
    vi.mocked(requireAdminRole).mockRejectedValueOnce(new ForbiddenError());
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost:3000/api/admin/stats"));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Forbidden: Admin authorization required",
    });
  });
});
