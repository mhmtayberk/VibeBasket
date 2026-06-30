import { describe, expect, it } from "vitest";
import {
  buildAdminSourceHealth,
  classifyCatalogFreshness,
  computeFailureStreak,
} from "./admin-ops";

describe("admin ops helpers", () => {
  it("computes failure streak from the most recent runs", () => {
    expect(
      computeFailureStreak([
        { success: false, completedAt: new Date(), sourceErrors: [] },
        { success: false, completedAt: new Date(), sourceErrors: [] },
        { success: true, completedAt: new Date(), sourceErrors: [] },
      ]),
    ).toBe(2);
  });

  it("classifies freshness by age", () => {
    const now = new Date("2026-06-13T12:00:00.000Z");
    expect(classifyCatalogFreshness("2026-06-13T09:00:00.000Z", now).label).toBe("Fresh");
    expect(classifyCatalogFreshness("2026-06-12T18:00:00.000Z", now).label).toBe("Aging");
    expect(classifyCatalogFreshness("2026-06-11T10:00:00.000Z", now).label).toBe("Stale");
  });

  it("builds source-health rows from recent errors and item counts", () => {
    const rows = buildAdminSourceHealth(
      [
        {
          success: false,
          completedAt: new Date(),
          sourceErrors: [
            {
              source: "official-mcp-registry",
              error: "timeout",
            },
          ],
        },
      ],
      [
        { sourceName: "verified-catalog", count: 42 },
        { sourceName: "official-mcp-registry", count: 100 },
        { sourceName: "skills-sh-official", count: 8 },
        { sourceName: "skills-sh-community", count: 12 },
      ],
    );

    expect(rows.find((row) => row.key === "official-mcp-registry")).toMatchObject({
      recentFailureCount: 1,
      lastError: "timeout",
      tone: "warning",
    });
    expect(rows.find((row) => row.key === "skills-sh-directory")).toMatchObject({
      itemCount: 20,
      recentFailureCount: 0,
      tone: "healthy",
    });
  });

  it("marks a source healthy again after a later clean run", () => {
    const rows = buildAdminSourceHealth(
      [
        {
          success: true,
          completedAt: new Date(),
          sourceErrors: [],
        },
        {
          success: false,
          completedAt: new Date(Date.now() - 60_000),
          sourceErrors: [
            {
              source: "official-mcp-registry",
              error: "timeout",
            },
          ],
        },
      ],
      [{ sourceName: "official-mcp-registry", count: 100 }],
    );

    expect(rows.find((row) => row.key === "official-mcp-registry")).toMatchObject({
      recentFailureCount: 1,
      lastError: "timeout",
      tone: "healthy",
    });
  });
});
