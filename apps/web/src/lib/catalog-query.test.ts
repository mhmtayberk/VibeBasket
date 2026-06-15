import { describe, expect, it } from "vitest";
import { buildCatalogCountCacheKey } from "./catalog-query";

describe("buildCatalogCountCacheKey", () => {
  it("includes the concrete search term so distinct queries do not share totals", () => {
    expect(
      buildCatalogCountCacheKey({
        type: "skill",
        trust: "all",
        freshness: "all",
        search: "context7",
      }),
    ).not.toBe(
      buildCatalogCountCacheKey({
        type: "skill",
        trust: "all",
        freshness: "all",
        search: "postgresql",
      }),
    );
  });

  it("normalizes search case for stable cache hits", () => {
    expect(
      buildCatalogCountCacheKey({
        type: "mcp",
        trust: "official",
        freshness: "fresh",
        search: "Context7",
      }),
    ).toBe(
      buildCatalogCountCacheKey({
        type: "mcp",
        trust: "official",
        freshness: "fresh",
        search: "context7",
      }),
    );
  });
});
