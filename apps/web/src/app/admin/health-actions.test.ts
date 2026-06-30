import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/admin-session", () => ({
  requireAdminRole: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { mockSelect, mockAll } = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockAll: vi.fn(),
}));

vi.mock("@vibebasket/core", () => ({
  bundles: {},
  catalogItems: {},
  db: {
    select: mockSelect,
    all: mockAll,
  },
  savedStacks: {},
  users: {},
}));

vi.mock("drizzle-orm", () => ({
  sql: <T = unknown>(strings: TemplateStringsArray) => strings.join("") as T,
}));

const { requireAdminRole } = await import("@/lib/admin-session");
const { getDbHealthAction } = await import("./health-actions");

describe("getDbHealthAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdminRole).mockResolvedValue({ id: "admin", role: "admin" } as never);

    mockSelect.mockImplementation(() => ({
      from: vi
        .fn()
        .mockResolvedValueOnce([{ count: 33271 }])
        .mockResolvedValueOnce([{ count: 2 }])
        .mockResolvedValueOnce([{ count: 1 }])
        .mockResolvedValueOnce([{ count: 0 }]),
    }));
  });

  it("treats a classic ok column from PRAGMA integrity_check as healthy", async () => {
    mockAll.mockResolvedValueOnce([{ ok: "ok" }]);

    const result = await getDbHealthAction();

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error("Expected success result");
    }
    expect(result.integrityOk).toBe(true);
  });

  it("treats an integrity_check column from PRAGMA integrity_check as healthy", async () => {
    mockAll.mockResolvedValueOnce([{ integrity_check: "ok" }]);

    const result = await getDbHealthAction();

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error("Expected success result");
    }
    expect(result.integrityOk).toBe(true);
  });

  it("returns unhealthy when PRAGMA integrity_check reports an error message", async () => {
    mockAll.mockResolvedValueOnce([{ integrity_check: "*** in database main ***" }]);

    const result = await getDbHealthAction();

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error("Expected success result");
    }
    expect(result.integrityOk).toBe(false);
  });
});
