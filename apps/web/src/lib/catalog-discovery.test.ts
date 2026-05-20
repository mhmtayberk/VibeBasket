import { describe, expect, it } from "vitest";
import {
  DAY_MS,
  OFFICIAL_SOURCE_NAMES,
  classifyCatalogFreshness,
  getCatalogDiscoveryDefaults,
  matchesCatalogFreshnessFilter,
  matchesCatalogTrustFilter,
  normalizeCatalogDiscoveryInput,
} from "./catalog-discovery";

describe("normalizeCatalogDiscoveryInput", () => {
  it("falls back to defaults for unsupported values", () => {
    expect(
      normalizeCatalogDiscoveryInput({
        trust: "weird",
        freshness: "stale-ish",
        sort: "random",
      })
    ).toEqual(getCatalogDiscoveryDefaults());
  });

  it("preserves supported values", () => {
    expect(
      normalizeCatalogDiscoveryInput({
        trust: "official",
        freshness: "recent",
        sort: "freshest",
      })
    ).toEqual({
      trust: "official",
      freshness: "recent",
      sort: "freshest",
    });
  });
});

describe("matchesCatalogTrustFilter", () => {
  it("treats verified items as their own lane", () => {
    expect(matchesCatalogTrustFilter({ verified: true, sourceName: "verified-catalog" }, "verified")).toBe(true);
    expect(matchesCatalogTrustFilter({ verified: true, sourceName: "verified-catalog" }, "official")).toBe(false);
  });

  it("recognizes official upstream sources", () => {
    for (const sourceName of OFFICIAL_SOURCE_NAMES) {
      expect(matchesCatalogTrustFilter({ verified: false, sourceName }, "official")).toBe(true);
    }
    expect(matchesCatalogTrustFilter({ verified: false, sourceName: "community-feed" }, "official")).toBe(false);
  });
});

describe("classifyCatalogFreshness", () => {
  const now = Date.UTC(2026, 4, 20, 12, 0, 0);

  it("classifies fresh, recent, and aging windows", () => {
    expect(classifyCatalogFreshness(now - 4 * 60 * 60 * 1000, now)).toBe("fresh");
    expect(classifyCatalogFreshness(now - 3 * DAY_MS, now)).toBe("recent");
    expect(classifyCatalogFreshness(now - 14 * DAY_MS, now)).toBe("aging");
  });

  it("treats missing sync times as aging", () => {
    expect(classifyCatalogFreshness(null, now)).toBe("aging");
  });
});

describe("matchesCatalogFreshnessFilter", () => {
  const now = Date.UTC(2026, 4, 20, 12, 0, 0);

  it("matches the recent window without including fresh rows", () => {
    expect(matchesCatalogFreshnessFilter({ lastSyncedAt: new Date(now - 3 * DAY_MS) }, "recent", now)).toBe(true);
    expect(matchesCatalogFreshnessFilter({ lastSyncedAt: new Date(now - 6 * 60 * 60 * 1000) }, "recent", now)).toBe(false);
  });
});
