import { describe, expect, it } from "vitest";
import { deriveCatalogTrust } from "./catalog-trust";

describe("deriveCatalogTrust", () => {
  it("prioritizes verified items with curated source label", () => {
    const trust = deriveCatalogTrust({
      verified: true,
      sourceName: "verified-catalog",
    });

    expect(trust.tier).toBe("verified");
    expect(trust.label).toBe("Verified");
    expect(trust.sourceLabel).toBe("Curated by VibeBasket");
  });

  it("classifies official upstream items separately from community ones", () => {
    const official = deriveCatalogTrust({
      verified: false,
      sourceName: "official-mcp-registry",
    });
    const community = deriveCatalogTrust({
      verified: false,
      sourceName: "some-community-source",
    });

    expect(official.tier).toBe("official");
    expect(official.label).toBe("Official");
    expect(community.tier).toBe("community");
    expect(community.label).toBe("Community");
  });

  it("assigns community tier regardless of install metadata", () => {
    const withInstalls = deriveCatalogTrust({
      verified: false,
      sourceName: "skills-sh-community",
    });
    expect(withInstalls.tier).toBe("community");
    expect(withInstalls.sourceLabel).toBe("skills.sh Community");
  });

  it("carries lastSyncedAt through trust metadata when present", () => {
    const trust = deriveCatalogTrust({
      verified: false,
      sourceName: "official-mcp-registry",
      lastSyncedAt: "2026-06-22T10:11:12.000Z",
    });

    expect(trust.lastSyncedAt).toBe("2026-06-22T10:11:12.000Z");
  });
});
