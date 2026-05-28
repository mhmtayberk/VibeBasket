import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const selectWhereMock = vi.fn();
const selectFromMock = vi.fn(() => ({
	where: selectWhereMock,
}));
const selectMock = vi.fn(() => ({
	from: selectFromMock,
}));
const insertValuesMock = vi.fn();
const insertMock = vi.fn(() => ({
	values: insertValuesMock,
}));

vi.mock("@vibebasket/core", async () => {
	const actual =
		await vi.importActual<typeof import("@vibebasket/core")>(
			"@vibebasket/core",
		);

	return {
		...actual,
		db: {
			select: selectMock,
			insert: insertMock,
		},
		bundles: {},
		catalogItems: {
			id: "id",
		},
	};
});

vi.mock("@/auth", () => ({
	auth: vi.fn(() => Promise.resolve(null)),
}));

vi.mock("drizzle-orm", () => ({
	inArray: vi.fn(() => "in-array"),
}));

vi.mock("nanoid", () => ({
	nanoid: vi.fn(() => "bundle-123456"),
}));

vi.mock("@/lib/targets", () => ({
	SUPPORTED_TARGET_IDS: ["claude-code", "cursor", "codex"],
	isSupportedTargetId: (targetId: string) =>
		["claude-code", "cursor", "codex"].includes(targetId),
}));

describe("POST /api/bundle", () => {
	beforeEach(() => {
		vi.resetModules();
		selectWhereMock.mockReset();
		selectFromMock.mockClear();
		selectMock.mockClear();
		insertValuesMock.mockReset();
		insertMock.mockClear();
	});

	it("creates a bundle from selected catalog rows and returns a fetchable URL", async () => {
		selectWhereMock.mockResolvedValueOnce([
			{
				id: "mcp-github",
				type: "mcp",
				data: {
					id: "mcp-github",
					displayName: "GitHub",
					runtime: "npx",
					args: ["-y", "@modelcontextprotocol/server-github"],
					env: {},
					requiredSecrets: [],
					verified: true,
				},
			},
			{
				id: "skill-postgresql-best-practices",
				type: "skill",
				data: {
					id: "skill-postgresql-best-practices",
					displayName: "Postgresql Best Practices",
					source: {
						type: "github",
						repo: "supabase/agent-skills",
						path: "supabase-postgres-best-practices",
						ref: "main",
					},
					verified: false,
				},
			},
		]);

		const { POST } = await import("./route");
		const response = await POST(
			new NextRequest("http://localhost:3000/api/bundle", {
				method: "POST",
				body: JSON.stringify({
					targets: ["claude-code"],
					scope: "user",
					itemIds: ["mcp-github", "skill-postgresql-best-practices"],
				}),
			}),
		);

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({
			id: "bundle-123456",
			url: "http://localhost:3000/api/bundle/bundle-123456",
		});

		expect(insertValuesMock).toHaveBeenCalledWith(
			expect.objectContaining({
				id: "bundle-123456",
				manifest: expect.objectContaining({
					schemaVersion: "0.1",
					scope: "user",
					targets: ["claude-code"],
					mcps: [expect.objectContaining({ id: "mcp-github" })],
					skills: [
						expect.objectContaining({ id: "skill-postgresql-best-practices" }),
					],
					rules: [],
					workflowPacks: [],
				}),
			}),
		);
	});

	it("returns 413 when the request body is larger than the hard limit", async () => {
		const { POST } = await import("./route");
		const oversizedBody = "x".repeat(100 * 1024 + 1);

		const response = await POST(
			new NextRequest("http://localhost:3000/api/bundle", {
				method: "POST",
				body: oversizedBody,
			}),
		);

		expect(response.status).toBe(413);
		await expect(response.json()).resolves.toEqual({
			error: "Bundle too large (max 100KB)",
		});
	});

	it("returns 400 when required fields are missing", async () => {
		const { POST } = await import("./route");

		const response = await POST(
			new NextRequest("http://localhost:3000/api/bundle", {
				method: "POST",
				body: JSON.stringify({
					targets: ["claude-code"],
					itemIds: ["mcp-github"],
				}),
			}),
		);

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({
			error: "Missing required fields",
		});
	});

	it("returns 400 when unsupported targets are requested", async () => {
		const { POST } = await import("./route");

		const response = await POST(
			new NextRequest("http://localhost:3000/api/bundle", {
				method: "POST",
				body: JSON.stringify({
					targets: ["unknown-target"],
					scope: "user",
					itemIds: ["mcp-github"],
				}),
			}),
		);

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({
			error: "Unsupported bundle targets: unknown-target",
		});
	});

	it("returns 400 when requested catalog items are missing", async () => {
		selectWhereMock.mockResolvedValueOnce([
			{
				id: "mcp-github",
				type: "mcp",
				data: {
					id: "mcp-github",
					displayName: "GitHub",
					runtime: "npx",
					args: [],
					env: {},
					requiredSecrets: [],
					verified: true,
				},
			},
		]);

		const { POST } = await import("./route");
		const response = await POST(
			new NextRequest("http://localhost:3000/api/bundle", {
				method: "POST",
				body: JSON.stringify({
					targets: ["claude-code"],
					scope: "user",
					itemIds: ["mcp-github", "skill-missing"],
				}),
			}),
		);

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({
			error: "Catalog items not found: skill-missing",
		});
	});
});
