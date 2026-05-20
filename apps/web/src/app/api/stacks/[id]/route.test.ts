import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const requireCurrentUserIdMock = vi.fn();

vi.mock("@/lib/session", () => ({
  SessionRequiredError: class SessionRequiredError extends Error {},
  requireCurrentUserId: requireCurrentUserIdMock,
}));

vi.mock("@vibebasket/core", () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  savedStackItems: {},
  savedStackTargets: {},
  savedStacks: {},
}));

describe("PATCH /api/stacks/[id]", () => {
  beforeEach(() => {
    vi.resetModules();
    requireCurrentUserIdMock.mockReset();
  });

  it("returns 401 when the user is not authenticated", async () => {
    const { SessionRequiredError } = await import("@/lib/session");
    requireCurrentUserIdMock.mockRejectedValueOnce(new SessionRequiredError());
    const { PATCH } = await import("./route");

    const response = await PATCH(
      new NextRequest("http://localhost:3000/api/stacks/stack-1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated" }),
      }),
      { params: Promise.resolve({ id: "stack-1" }) } as RouteContext<"/api/stacks/[id]">
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Authentication required." });
  });

  it("returns 400 when no update fields are provided", async () => {
    requireCurrentUserIdMock.mockResolvedValueOnce("user-1");
    const { PATCH } = await import("./route");

    const response = await PATCH(
      new NextRequest("http://localhost:3000/api/stacks/stack-1", {
        method: "PATCH",
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: "stack-1" }) } as RouteContext<"/api/stacks/[id]">
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Provide at least one field to update.",
    });
  });
});
