import { describe, expect, it } from "vitest";

import { sanitizeCallbackUrl } from "./safe-redirect";

describe("sanitizeCallbackUrl", () => {
  it("allows internal relative paths", () => {
    expect(sanitizeCallbackUrl("/stacks")).toBe("/stacks");
    expect(sanitizeCallbackUrl("/docs?tab=security")).toBe("/docs?tab=security");
  });

  it("falls back for empty or external values", () => {
    expect(sanitizeCallbackUrl(undefined)).toBe("/");
    expect(sanitizeCallbackUrl("")).toBe("/");
    expect(sanitizeCallbackUrl("https://evil.example")).toBe("/");
    expect(sanitizeCallbackUrl("//evil.example")).toBe("/");
    expect(sanitizeCallbackUrl("javascript:alert(1)")).toBe("/");
  });
});
