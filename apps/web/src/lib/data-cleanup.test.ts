import { describe, expect, it, vi } from "vitest";

const dbRun = vi.fn(() => Promise.resolve());
const dbDeleteWhere = vi.fn(() => Promise.resolve());
const dbDelete = vi.fn(() => ({ where: dbDeleteWhere }));
const dbSelectFromOrderByLimit = vi.fn(() => Promise.resolve([{ count: 0 }]));
const dbSelectFromOrderBy = vi.fn(() => ({ limit: dbSelectFromOrderByLimit }));
const dbSelectFrom = vi.fn(() => ({ orderBy: dbSelectFromOrderBy }));
const dbSelect = vi.fn(() => ({ from: dbSelectFrom }));

vi.mock("@vibebasket/core", () => ({
  db: {
    select: dbSelect,
    delete: dbDelete,
    run: dbRun,
  },
  sessions: {} as unknown,
  verificationTokens: {} as unknown,
  catalogSyncRuns: {} as unknown,
  bundles: {} as unknown,
  sql: ((strings: TemplateStringsArray, ...values: unknown[]) =>
    strings.reduce(
      (acc, part, index) => `${acc}${part}${index < values.length ? String(values[index]) : ""}`,
      "",
    )) as unknown as ReturnType<typeof import("drizzle-orm").sql>,
}));

describe("cleanupStaleData", () => {
  it("runs only once per hour (throttle guard)", async () => {
    const mod = await import("./data-cleanup");
    await mod.cleanupStaleData();
    const start = Date.now();
    await mod.cleanupStaleData();
    expect(Date.now() - start).toBeLessThan(200);
  });

  it("does not throw on DB error", async () => {
    const mod = await import("./data-cleanup");
    await expect(mod.cleanupStaleData()).resolves.toBeUndefined();
  });

  it("uses Date cutoffs for timestamp-mode cleanup queries", async () => {
    vi.resetModules();
    dbRun.mockClear();
    dbDelete.mockClear();
    dbDeleteWhere.mockClear();
    dbSelect.mockClear();
    dbSelectFrom.mockClear();
    dbSelectFromOrderBy.mockClear();
    dbSelectFromOrderByLimit.mockClear();

    const mod = await import("./data-cleanup");
    await mod.cleanupStaleData(true);

    const sessionCleanup = dbRun.mock.calls.at(0)?.at(0) as
      | { queryChunks?: Array<{ value?: string[] } | Date> }
      | undefined;
    const verificationCleanup = dbRun.mock.calls.at(1)?.at(0) as
      | { queryChunks?: Array<{ value?: string[] } | Date> }
      | undefined;
    expect(sessionCleanup).toBeDefined();
    expect(verificationCleanup).toBeDefined();
    if (!sessionCleanup || !verificationCleanup) {
      throw new Error("expected cleanup queries to be recorded");
    }

    expect(
      String(
        (sessionCleanup.queryChunks?.[0] as { value?: string[] } | undefined)?.value?.[0] ?? "",
      ),
    ).toContain("DELETE FROM sessions WHERE expires < ");
    expect(sessionCleanup.queryChunks?.[1]).toBeInstanceOf(Date);

    expect(
      String(
        (verificationCleanup.queryChunks?.[0] as { value?: string[] } | undefined)?.value?.[0] ??
          "",
      ),
    ).toContain("DELETE FROM verification_tokens WHERE expires < ");
    expect(verificationCleanup.queryChunks?.[1]).toBeInstanceOf(Date);

    const bundleCleanup = dbDeleteWhere.mock.calls.at(0)?.at(0) as
      | { queryChunks?: unknown[] }
      | undefined;
    expect(bundleCleanup?.queryChunks?.some((chunk) => chunk instanceof Date)).toBe(true);
  });
});
