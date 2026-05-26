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

	it("calculates dynamic popularity bonus scores for community assets", () => {
		// 1. High popularity (installs > 1000)
		const high = deriveCatalogTrust({
			verified: false,
			sourceName: "skills-sh-community",
			data: { installs: 1250 },
		});
		expect(high.score).toBe(75);
		expect(high.detail).toContain("Highly popular community");

		// 2. Medium popularity (installs > 200)
		const medium = deriveCatalogTrust({
			verified: false,
			sourceName: "skills-sh-community",
			data: { installs: 450 },
		});
		expect(medium.score).toBe(68);
		expect(medium.detail).toContain("Widely used community");

		// 3. Low popularity (installs > 50)
		const low = deriveCatalogTrust({
			verified: false,
			sourceName: "skills-sh-community",
			data: { installs: 75 },
		});
		expect(low.score).toBe(64);

		// 4. Default community score (installs <= 50)
		const none = deriveCatalogTrust({
			verified: false,
			sourceName: "skills-sh-community",
			data: { installs: 10 },
		});
		expect(none.score).toBe(60);
	});
});
