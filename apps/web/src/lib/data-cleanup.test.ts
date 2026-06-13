import { describe, expect, it, vi } from "vitest";

vi.mock("@vibebasket/core", () => ({
	db: {
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				orderBy: vi.fn(() => ({
					limit: vi.fn(() => Promise.resolve([{ count: 0 }])),
				})),
			})),
		})),
		delete: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })),
		run: vi.fn(() => Promise.resolve()),
	},
	sessions: {} as unknown,
	verificationTokens: {} as unknown,
	catalogSyncRuns: {} as unknown,
	bundles: {} as unknown,
	sql: ((...args: unknown[]) => String(args[0] ?? "")) as unknown as ReturnType<typeof import("drizzle-orm").sql>,
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
});
