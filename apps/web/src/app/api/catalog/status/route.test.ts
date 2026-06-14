import { resetRateLimitBuckets } from "@/lib/rate-limit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const selectMock = vi.fn();
const ensureDatabaseIndexesMock = vi.fn();

vi.mock("@vibebasket/core", () => ({
  db: {
    select: selectMock,
  },
  catalogItems: {
    type: "type",
    createdAt: "created_at",
    lastSyncedAt: "last_synced_at",
  },
  catalogSyncRuns: {
    completedAt: "completed_at",
  },
  ensureDatabaseIndexes: ensureDatabaseIndexesMock,
}));

vi.mock("drizzle-orm", () => ({
  asc: vi.fn((value) => value),
  desc: vi.fn((value) => value),
  sql: vi.fn(() => 0),
}));

function queueSelectResult(result: unknown) {
  selectMock.mockImplementationOnce(() => ({
    from: () => ({
      groupBy: () => ({
        orderBy: () => Promise.resolve(result),
      }),
      orderBy: () => ({
        limit: () => Promise.resolve(result),
      }),
    }),
  }));
}

describe("GET /api/catalog/status", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetRateLimitBuckets();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-22T11:10:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns catalog freshness and counts", async () => {
    queueSelectResult([{ type: "mcp", total: 10 }]);
    queueSelectResult([
      {
        createdAt: new Date("2026-05-22T10:00:00.000Z"),
        lastSyncedAt: new Date("2026-05-22T11:00:00.000Z"),
      },
    ]);
    queueSelectResult([
      {
        trigger: "manual",
        success: true,
        totalItems: 10,
        mcps: 10,
        skills: 0,
        rules: 0,
        workflows: 0,
        durationMs: 100,
        sourceErrors: [],
        startedAt: new Date("2026-05-22T10:59:00.000Z"),
        completedAt: new Date("2026-05-22T11:00:00.000Z"),
      },
    ]);

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost:3000/api/catalog/status"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      counts: { mcp: 10 },
      freshness: {
        latestCatalogItemAt: "2026-05-22T10:00:00.000Z",
        latestCatalogSyncAt: "2026-05-22T11:00:00.000Z",
        stale: false,
      },
      lastSync: {
        trigger: "manual",
        success: true,
        totalItems: 10,
        mcps: 10,
        skills: 0,
        rules: 0,
        workflows: 0,
        durationMs: 100,
        sourceErrors: [],
        startedAt: "2026-05-22T10:59:00.000Z",
        completedAt: "2026-05-22T11:00:00.000Z",
      },
    });
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("returns 429 when requests exceed the status route limit", async () => {
    for (let index = 0; index < 18; index += 1) {
      queueSelectResult([]);
    }

    const { GET } = await import("./route");
    for (let index = 0; index < 5; index += 1) {
      await GET(new Request("http://localhost:3000/api/catalog/status"));
    }

    const response = await GET(new Request("http://localhost:3000/api/catalog/status"));
    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: "Too many requests",
    });
  });
});
