import { beforeEach, describe, expect, it, vi } from "vitest";
import { triggerSyncAction } from "./actions";

vi.mock("@/lib/admin-session", () => ({
	ForbiddenError: class ForbiddenError extends Error {
		constructor() {
			super("Forbidden");
			this.name = "ForbiddenError";
		}
	},
	requireAdminRole: vi.fn(),
}));

vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
}));

const { mockSyncAll } = vi.hoisted(() => {
	const fn = vi.fn();
	return { mockSyncAll: fn };
});

vi.mock("@vibebasket/registry", () => ({
	RegistrySyncService: vi.fn().mockImplementation(() => ({
		syncAll: mockSyncAll,
	})),
}));

const { requireAdminRole, ForbiddenError } = await import(
	"@/lib/admin-session"
);
const { revalidatePath } = await import("next/cache");

// Minimal mock that satisfies the User return type from requireAdminRole
const MOCK_ADMIN_USER = { id: "admin-id", role: "admin" } as Awaited<
	ReturnType<typeof requireAdminRole>
>;

function buildSyncSummary(overrides: Partial<{
	totalItems: number;
	mcpAdded: number;
	skillAdded: number;
	ruleAdded: number;
	workflowAdded: number;
	sourceErrors: Array<{ source: string; error: string }>;
}> = {}) {
	return {
		mcps: { added: overrides.mcpAdded ?? 5, updated: 0, errors: 0 },
		skills: { added: overrides.skillAdded ?? 3, updated: 0, errors: 0 },
		rules: { added: overrides.ruleAdded ?? 0, updated: 0, errors: 0 },
		workflows: { added: overrides.workflowAdded ?? 0, updated: 0, errors: 0 },
		totalItems: overrides.totalItems ?? 8,
		sourceErrors: overrides.sourceErrors ?? [],
	};
}

describe("triggerSyncAction", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(requireAdminRole).mockReset();
		mockSyncAll?.mockReset();
		vi.mocked(revalidatePath).mockReset();
	});

	// --- Auth guard ---

	it("blocks execution when user is not an administrator", async () => {
		vi.mocked(requireAdminRole).mockRejectedValueOnce(new ForbiddenError());
		await expect(triggerSyncAction()).rejects.toThrow(ForbiddenError);
	});

	it("blocks execution when session is null (unauthenticated)", async () => {
		vi.mocked(requireAdminRole).mockRejectedValueOnce(
			new ForbiddenError("Forbidden: Admin access required"),
		);
		await expect(triggerSyncAction()).rejects.toThrow(ForbiddenError);
	});

	// --- Happy path ---

	it("executes synchronization and returns exact item details", async () => {
		vi.mocked(requireAdminRole).mockResolvedValueOnce(MOCK_ADMIN_USER);
		mockSyncAll.mockResolvedValueOnce(
			buildSyncSummary({ totalItems: 17, mcpAdded: 12, skillAdded: 5 }),
		);

		const result = await triggerSyncAction();

		expect(requireAdminRole).toHaveBeenCalledTimes(1);
		expect(revalidatePath).toHaveBeenCalledWith("/admin");
		expect(result).toEqual({
			success: true,
			summary: {
				totalItems: 17,
				mcps: 12,
				skills: 5,
				durationMs: expect.any(Number),
				sourceErrorsCount: 0,
			},
		});
		expect(result.summary!.durationMs).toBeGreaterThanOrEqual(0);
	});

	// --- Zero items ---

	it("handles empty sync results (zero items ingested)", async () => {
		vi.mocked(requireAdminRole).mockResolvedValueOnce(MOCK_ADMIN_USER);
		mockSyncAll.mockResolvedValueOnce(
			buildSyncSummary({ totalItems: 0, mcpAdded: 0, skillAdded: 0 }),
		);

		const result = await triggerSyncAction();

		expect(revalidatePath).toHaveBeenCalledWith("/admin");
		expect(result).toEqual({
			success: true,
			summary: {
				totalItems: 0,
				mcps: 0,
				skills: 0,
				durationMs: expect.any(Number),
				sourceErrorsCount: 0,
			},
		});
	});

	// --- Large sync ---

	it("handles large syncs with thousands of items", async () => {
		vi.mocked(requireAdminRole).mockResolvedValueOnce(MOCK_ADMIN_USER);
		mockSyncAll.mockResolvedValueOnce(
			buildSyncSummary({
				totalItems: 40761,
				mcpAdded: 20827,
				skillAdded: 19932,
				ruleAdded: 1,
				workflowAdded: 1,
			}),
		);

		const result = await triggerSyncAction();

		expect(result.success).toBe(true);
		expect(result.summary).toEqual({
			totalItems: 40761,
			mcps: 20827,
			skills: 19932,
			durationMs: expect.any(Number),
			sourceErrorsCount: 0,
		});
	});

	// --- Source errors (partial failure) ---

	it("reports success:true even when sync has source errors", async () => {
		vi.mocked(requireAdminRole).mockResolvedValueOnce(MOCK_ADMIN_USER);
		mockSyncAll.mockResolvedValueOnce(
			buildSyncSummary({
				totalItems: 100,
				mcpAdded: 50,
				skillAdded: 50,
				sourceErrors: [
					{ source: "skills-sh", error: "Sitemap fetch timeout" },
					{ source: "mcp-registry", error: "Pagination cursor invalid" },
				],
			}),
		);

		const result = await triggerSyncAction();

		expect(result.success).toBe(true);
		expect(result.summary!.sourceErrorsCount).toBe(2);
		expect(revalidatePath).toHaveBeenCalledWith("/admin");
	});

	// --- Error handling: various error types ---

	it("handles Error instance with message", async () => {
		vi.mocked(requireAdminRole).mockResolvedValueOnce(MOCK_ADMIN_USER);
		mockSyncAll.mockRejectedValueOnce(new Error("Registry server timeout"));

		const result = await triggerSyncAction();

		expect(result).toEqual({
			success: false,
			error: "Registry server timeout",
		});
		expect(revalidatePath).not.toHaveBeenCalled();
	});

	it("handles network fetch failure", async () => {
		vi.mocked(requireAdminRole).mockResolvedValueOnce(MOCK_ADMIN_USER);
		mockSyncAll.mockRejectedValueOnce(
			new TypeError("fetch failed"),
		);

		const result = await triggerSyncAction();

		expect(result).toEqual({
			success: false,
			error: "fetch failed",
		});
		expect(revalidatePath).not.toHaveBeenCalled();
	});

	it("handles non-Error thrown values (string)", async () => {
		vi.mocked(requireAdminRole).mockResolvedValueOnce(MOCK_ADMIN_USER);
		mockSyncAll.mockRejectedValueOnce("Unexpected raw string error");

		const result = await triggerSyncAction();

		expect(result).toEqual({
			success: false,
			error: "An unexpected error occurred during synchronization",
		});
		expect(revalidatePath).not.toHaveBeenCalled();
	});

	it("handles non-Error thrown values (object)", async () => {
		vi.mocked(requireAdminRole).mockResolvedValueOnce(MOCK_ADMIN_USER);
		mockSyncAll.mockRejectedValueOnce({ code: 500 });

		const result = await triggerSyncAction();

		expect(result).toEqual({
			success: false,
			error: "An unexpected error occurred during synchronization",
		});
	});

	it("handles Error with empty message", async () => {
		vi.mocked(requireAdminRole).mockResolvedValueOnce(MOCK_ADMIN_USER);
		mockSyncAll.mockRejectedValueOnce(new Error(""));

		const result = await triggerSyncAction();

		expect(result).toEqual({
			success: false,
			error: "An unexpected error occurred during synchronization",
		});
	});

	// --- Authorization called before any registry work ---

	it("checks admin role before calling RegistrySyncService", async () => {
		vi.mocked(requireAdminRole).mockRejectedValueOnce(new ForbiddenError());

		await expect(triggerSyncAction()).rejects.toThrow(ForbiddenError);

		// RegistrySyncService should never be constructed
		const { RegistrySyncService } = await import("@vibebasket/registry");
		expect(RegistrySyncService).not.toHaveBeenCalled();
	});

	// --- Duration measurement ---

	it("measures sync duration in milliseconds", async () => {
		vi.mocked(requireAdminRole).mockResolvedValueOnce(MOCK_ADMIN_USER);

		let resolveSync: (value: unknown) => void;
		const syncPromise = new Promise((resolve) => {
			resolveSync = resolve;
		});
		mockSyncAll.mockReturnValueOnce(syncPromise);

		const resultPromise = triggerSyncAction();

		// Resolve after a small delay to simulate work
		await new Promise((r) => setTimeout(r, 15));
		resolveSync!(buildSyncSummary({ totalItems: 5 }));

		const result = await resultPromise;

		expect(result.summary!.durationMs).toBeGreaterThanOrEqual(10);
	});

	// --- Race condition / concurrent calls ---

	it("allows sequential manual sync trigger without state corruption", async () => {
		vi.mocked(requireAdminRole).mockResolvedValue(MOCK_ADMIN_USER);
		mockSyncAll.mockResolvedValue(
			buildSyncSummary({ totalItems: 3, mcpAdded: 2, skillAdded: 1 }),
		);

		const result1 = await triggerSyncAction();
		const result2 = await triggerSyncAction();

		expect(requireAdminRole).toHaveBeenCalledTimes(2);
		expect(mockSyncAll).toHaveBeenCalledTimes(2);
		expect(revalidatePath).toHaveBeenCalledTimes(2);
		expect(result1.success).toBe(true);
		expect(result2.success).toBe(true);
	});

	// --- revalidatePath behavior ---

	it("revalidates admin path on successful sync", async () => {
		vi.mocked(requireAdminRole).mockResolvedValueOnce(MOCK_ADMIN_USER);
		mockSyncAll.mockResolvedValueOnce(buildSyncSummary());

		await triggerSyncAction();

		expect(revalidatePath).toHaveBeenCalledWith("/admin");
		expect(revalidatePath).toHaveBeenCalledTimes(1);
	});

	it("does not revalidate admin path on sync failure", async () => {
		vi.mocked(requireAdminRole).mockResolvedValueOnce(MOCK_ADMIN_USER);
		mockSyncAll.mockRejectedValueOnce(new Error("Sync crash"));

		await triggerSyncAction();

		expect(revalidatePath).not.toHaveBeenCalled();
	});

	// --- Partial summary edge cases ---

	it("handles summary with undefined mandatory fields gracefully", async () => {
		vi.mocked(requireAdminRole).mockResolvedValueOnce(MOCK_ADMIN_USER);
		mockSyncAll.mockResolvedValueOnce({
			mcps: null,
			skills: { added: 1 },
			totalItems: 1,
			sourceErrors: [],
		});

		const result = await triggerSyncAction();

		expect(result.success).toBe(true);
	});

	// --- Stress: many sequential syncs ---

	it("handles multiple sequential sync triggers without state corruption", async () => {
		vi.mocked(requireAdminRole).mockResolvedValue(MOCK_ADMIN_USER);
		mockSyncAll.mockResolvedValue(
			buildSyncSummary({ totalItems: 1, mcpAdded: 1, skillAdded: 0 }),
		);

		const results = [];
		for (let i = 0; i < 5; i++) {
			results.push(await triggerSyncAction());
		}

		for (const result of results) {
			expect(result.success).toBe(true);
		}
		expect(mockSyncAll).toHaveBeenCalledTimes(5);
	});
});
