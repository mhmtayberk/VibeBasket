import { describe, expect, it, vi } from "vitest";
import { deriveCatalogTrust } from "./catalog-trust";

describe("deriveCatalogTrust", () => {
	it("prioritizes verified items", () => {
		vi.setSystemTime(new Date("2026-05-17T00:00:00.000Z"));
		const trust = deriveCatalogTrust({
			verified: true,
			sourceName: "verified-catalog",
		});

		expect(trust.tier).toBe("verified");
		expect(trust.score).toBe(100);
		expect(trust.sourceLabel).toBe("Curated");
	});

	it("classifies official upstream items separately from community ones", () => {
		vi.setSystemTime(new Date("2026-05-17T00:00:00.000Z"));

		const official = deriveCatalogTrust({
			verified: false,
			sourceName: "official-mcp-registry",
		});
		const community = deriveCatalogTrust({
			verified: false,
			sourceName: "some-community-source",
		});

		expect(official.tier).toBe("official");
		expect(community.tier).toBe("community");
		expect(official.score).toBeGreaterThan(community.score);
	});
});
