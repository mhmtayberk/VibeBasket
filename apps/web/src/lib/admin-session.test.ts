import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const assertTrustedMutationOriginMock = vi.fn();

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/csrf", () => ({
  InvalidOriginError: class InvalidOriginError extends Error {},
  assertTrustedMutationOrigin: assertTrustedMutationOriginMock,
}));

describe("admin-session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows verified admin sessions", async () => {
    authMock.mockResolvedValueOnce({
      user: { id: "1", role: "admin" },
    });

    const { requireAdminRole } = await import("./admin-session");
    await expect(requireAdminRole()).resolves.toEqual({ id: "1", role: "admin" });
    expect(authMock).toHaveBeenCalledTimes(1);
  });

  it("rejects non-admin sessions", async () => {
    authMock.mockResolvedValueOnce({
      user: { id: "1", role: "user" },
    });

    const { ForbiddenError, requireAdminRole } = await import("./admin-session");
    await expect(requireAdminRole()).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("checks trusted mutation origin before role lookup", async () => {
    authMock.mockResolvedValueOnce({
      user: { id: "1", role: "admin" },
    });

    const request = new Request("http://localhost/api/admin");
    const { requireAdminMutation } = await import("./admin-session");

    await expect(requireAdminMutation(request)).resolves.toEqual({ id: "1", role: "admin" });
    expect(assertTrustedMutationOriginMock).toHaveBeenCalledWith(request);
  });
});
