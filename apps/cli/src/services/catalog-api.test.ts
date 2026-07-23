import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CatalogApiClient } from "./catalog-api.js";

describe("CatalogApiClient refresh guardrails", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-23T12:00:00.000Z"));
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("deduplicates concurrent refresh calls in flight", async () => {
    let calls = 0;
    let resolveFetch: (() => void) | null = null;

    global.fetch = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          calls += 1;
          resolveFetch = () =>
            resolve(
              new Response(
                JSON.stringify({
                  items: [],
                  pagination: undefined,
                  source: "network",
                  cached: false,
                }),
                {
                  status: 200,
                  headers: { "content-type": "application/json" },
                },
              ),
            );
        }),
    ) as typeof fetch;

    const client = new CatalogApiClient("https://vibebasket.dev");
    const first = client.refresh();
    const second = client.refresh();

    expect(calls).toBe(1);

    resolveFetch?.();

    await expect(first).resolves.toMatchObject({ refreshed: true });
    await expect(second).resolves.toMatchObject({ refreshed: true });
  });

  it("enforces cooldown after a successful refresh", async () => {
    global.fetch = vi.fn(async () => new Response("{}", { status: 200 })) as typeof fetch;

    const client = new CatalogApiClient("https://vibebasket.dev");
    await expect(client.refresh()).resolves.toMatchObject({
      refreshed: true,
      cooldownMsRemaining: 0,
    });
    await expect(client.refresh()).resolves.toMatchObject({
      refreshed: false,
      forced: false,
      cooldownMsRemaining: 300000,
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
