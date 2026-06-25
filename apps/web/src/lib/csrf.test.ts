import { describe, expect, it, vi } from "vitest";
import { InvalidOriginError, assertTrustedMutationOrigin } from "./csrf";

describe("assertTrustedMutationOrigin", () => {
  it("accepts same-origin requests", () => {
    const request = new Request("https://vibebasket.dev/api/stacks", {
      method: "POST",
      headers: {
        origin: "https://vibebasket.dev",
      },
    });

    expect(() => assertTrustedMutationOrigin(request)).not.toThrow();
  });

  it("uses NEXTAUTH_URL as the production origin source of truth", () => {
    vi.stubEnv("NEXTAUTH_URL", "https://app.vibebasket.dev");
    const request = new Request("https://internal-service/api/stacks", {
      method: "POST",
      headers: {
        origin: "https://app.vibebasket.dev",
      },
    });

    expect(() => assertTrustedMutationOrigin(request)).not.toThrow();
    vi.unstubAllEnvs();
  });

  it("falls back to NEXT_PUBLIC_SITE_URL when NEXTAUTH_URL is absent", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://b.example.com");
    const request = new Request("https://internal-service/api/stacks", {
      method: "POST",
      headers: {
        origin: "https://b.example.com",
      },
    });

    expect(() => assertTrustedMutationOrigin(request)).not.toThrow();
    vi.unstubAllEnvs();
  });

  it("rejects missing origins", () => {
    const request = new Request("https://vibebasket.dev/api/stacks", {
      method: "POST",
    });

    expect(() => assertTrustedMutationOrigin(request)).toThrow(InvalidOriginError);
  });

  it("rejects cross-origin mutations", () => {
    const request = new Request("https://vibebasket.dev/api/stacks", {
      method: "POST",
      headers: {
        origin: "https://evil.example",
      },
    });

    expect(() => assertTrustedMutationOrigin(request)).toThrow(InvalidOriginError);
  });
});
