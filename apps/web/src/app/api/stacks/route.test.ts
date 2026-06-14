import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentUserIdMock = vi.fn();

vi.mock("@/lib/session", () => ({
  SessionRequiredError: class SessionRequiredError extends Error {},
  requireCurrentUserId: requireCurrentUserIdMock,
}));

vi.mock("@vibebasket/core", () => ({
  db: {
    select: vi.fn(),
    transaction: vi.fn(),
  },
  catalogItems: {},
  savedStackItems: {},
  savedStackTargets: {},
  savedStacks: {},
}));

describe("GET /api/stacks", () => {
  beforeEach(() => {
    vi.resetModules();
    requireCurrentUserIdMock.mockReset();
  });

  it("returns 401 when the user is not authenticated", async () => {
    const { SessionRequiredError } = await import("@/lib/session");
    requireCurrentUserIdMock.mockRejectedValueOnce(new SessionRequiredError());
    const { GET } = await import("./route");

    const response = await GET(
      new NextRequest("http://localhost:3000/api/stacks"),
      {} as RouteContext<"/api/stacks">,
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Authentication required.",
    });
  });
});

describe("POST /api/stacks", () => {
  beforeEach(() => {
    vi.resetModules();
    requireCurrentUserIdMock.mockReset();
  });

  it("returns 400 for unsupported target ids", async () => {
    requireCurrentUserIdMock.mockResolvedValueOnce("user-1");
    const { POST } = await import("./route");

    const response = await POST(
      new NextRequest("http://localhost:3000/api/stacks", {
        method: "POST",
        body: JSON.stringify({
          name: "React Stack",
          itemIds: ["mcp-a"],
          targetIds: ["unknown-target"],
        }),
      }),
      {} as RouteContext<"/api/stacks">,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Unsupported target IDs: unknown-target",
    });
  });

  it("returns 400 for empty item selection", async () => {
    requireCurrentUserIdMock.mockResolvedValueOnce("user-1");
    const { POST } = await import("./route");

    const response = await POST(
      new NextRequest("http://localhost:3000/api/stacks", {
        method: "POST",
        body: JSON.stringify({
          name: "Empty Stack",
          itemIds: [],
          targetIds: ["claude-code"],
        }),
      }),
      {} as RouteContext<"/api/stacks">,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Array must contain at least 1 element(s)",
    });
  });
});
