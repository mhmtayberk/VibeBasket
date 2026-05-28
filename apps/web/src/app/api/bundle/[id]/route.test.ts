import { beforeEach, describe, expect, it, vi } from "vitest";

const limitMock = vi.fn();
const whereMock = vi.fn(() => ({
	limit: limitMock,
}));
const fromMock = vi.fn(() => ({
	where: whereMock,
}));
const selectMock = vi.fn(() => ({
	from: fromMock,
}));
const delWhereMock = vi.fn();
const delMock = vi.fn(() => ({
	where: delWhereMock,
}));

vi.mock("@vibebasket/core", () => ({
	db: {
		select: selectMock,
		delete: delMock,
	},
	bundles: {
		id: "id",
	},
}));

vi.mock("drizzle-orm", () => ({
	eq: vi.fn(() => "eq"),
	lt: vi.fn(() => "lt"),
	and: vi.fn((...args: unknown[]) => args),
	isNull: vi.fn(() => "is-null"),
}));

describe("GET /api/bundle/[id]", () => {
	beforeEach(() => {
		vi.resetModules();
		selectMock.mockClear();
		fromMock.mockClear();
		whereMock.mockClear();
		limitMock.mockReset();
	});

	it("returns the stored manifest when the bundle exists", async () => {
		limitMock.mockResolvedValueOnce([
			{
				manifest: {
					schemaVersion: "0.1",
					scope: "user",
					targets: ["claude-code"],
					mcps: [],
					skills: [],
					rules: [],
					workflowPacks: [],
				},
			},
		]);

		const { GET } = await import("./route");
		const response = await GET(
			new Request("http://localhost:3000/api/bundle/bundle-123456"),
			{
				params: Promise.resolve({ id: "bundle-123456" }),
			},
		);

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({
			schemaVersion: "0.1",
			scope: "user",
			targets: ["claude-code"],
			mcps: [],
			skills: [],
			rules: [],
			workflowPacks: [],
		});
	});

	it("returns 404 when the bundle does not exist", async () => {
		limitMock.mockResolvedValueOnce([]);

		const { GET } = await import("./route");
		const response = await GET(
			new Request("http://localhost:3000/api/bundle/missing"),
			{
				params: Promise.resolve({ id: "missing" }),
			},
		);

		expect(response.status).toBe(404);
		await expect(response.json()).resolves.toEqual({
			error: "Bundle not found",
		});
	});
});
