import type { BasketItem } from "@/store/basketStore";

export type TrustTier = "verified" | "official" | "community";

export interface CatalogTrust {
	tier: TrustTier;
	score: number;
	label: string;
	detail: string;
	sourceLabel: string;
}

interface CatalogLikeItem {
	verified?: boolean | null;
	sourceName?: string | null;
	data?: any; // Dynamic full catalog data object containing stats/installs
}

function sourceLabel(sourceName?: string | null) {
	switch (sourceName) {
		case "verified-catalog":
			return "Curated";
		case "official-mcp-registry":
			return "Official MCP Registry";
		case "skills-sh-official":
			return "skills.sh Official";
		case "skills-sh-community":
			return "skills.sh Community";
		default:
			return "Community";
	}
}

/**
 * Advanced, dynamic trust rank evaluator.
 * Performs rigorous data-driven assessment on community resources, promoting score
 * values based on install densities while keeping strict 100/82 curate thresholds.
 */
export function deriveCatalogTrust(item: CatalogLikeItem): CatalogTrust {
	const labelForSource = sourceLabel(item.sourceName);

	// 1. Verified Curated Tier
	if (item.verified) {
		return {
			tier: "verified",
			score: 100,
			label: "Verified",
			detail: "Curated by VibeBasket and preferred over upstream variants.",
			sourceLabel: labelForSource,
		};
	}

	// 2. Official Upstream Tier
	if (
		item.sourceName === "official-mcp-registry" ||
		item.sourceName === "skills-sh-official"
	) {
		return {
			tier: "official",
			score: 82,
			label: "Official",
			detail: "Synced from an official upstream catalog source.",
			sourceLabel: labelForSource,
		};
	}

	// 3. Dynamic Community Tier (Calculates relative popularities from metadata)
	let communityScore = 60;
	let popularitySuffix = "";

	if (item.data) {
		try {
			// Extract installation densities safely
			const dataObj = typeof item.data === "string" ? JSON.parse(item.data) : item.data;
			const installs = Number(dataObj?.installs ?? 0);

			if (installs > 1000) {
				communityScore = 75;
				popularitySuffix = " (Highly popular community contribution)";
			} else if (installs > 200) {
				communityScore = 68;
				popularitySuffix = " (Widely used community contribution)";
			} else if (installs > 50) {
				communityScore = 64;
				popularitySuffix = " (Growing community contribution)";
			}
		} catch {
			// Fail-safe degradation back to base score of 60
		}
	}

	return {
		tier: "community",
		score: communityScore,
		label: "Community",
		detail: `Available in the catalog, but not part of the curated verified set${popularitySuffix}.`,
		sourceLabel: labelForSource,
	};
}

export function withCatalogTrust<T extends BasketItem>(
	item: T,
	source: CatalogLikeItem,
): T {
	return {
		...item,
		trust: deriveCatalogTrust(source),
	};
}
