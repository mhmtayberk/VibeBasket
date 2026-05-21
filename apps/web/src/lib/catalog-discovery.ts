export const DAY_MS = 24 * 60 * 60 * 1000;

export const OFFICIAL_SOURCE_NAMES = [
	"official-mcp-registry",
	"skills-sh-official",
] as const;

export type CatalogTrustFilter = "all" | "verified" | "official" | "community";
export type CatalogFreshnessFilter = "all" | "fresh" | "recent" | "aging";
export type CatalogSort = "recommended" | "freshest" | "name";

export interface CatalogDiscoveryState {
	trust: CatalogTrustFilter;
	freshness: CatalogFreshnessFilter;
	sort: CatalogSort;
}

export const TRUST_FILTER_OPTIONS: Array<{
	value: CatalogTrustFilter;
	label: string;
}> = [
	{ value: "all", label: "All trust" },
	{ value: "verified", label: "Verified" },
	{ value: "official", label: "Official" },
	{ value: "community", label: "Community" },
];

export const FRESHNESS_FILTER_OPTIONS: Array<{
	value: CatalogFreshnessFilter;
	label: string;
}> = [
	{ value: "all", label: "Any freshness" },
	{ value: "fresh", label: "Fresh" },
	{ value: "recent", label: "Recent" },
	{ value: "aging", label: "Aging" },
];

export const SORT_OPTIONS: Array<{ value: CatalogSort; label: string }> = [
	{ value: "recommended", label: "Recommended" },
	{ value: "freshest", label: "Freshest" },
	{ value: "name", label: "A-Z" },
];

interface CatalogDiscoveryLikeItem {
	verified?: boolean | null;
	sourceName?: string | null;
	lastSyncedAt?: Date | string | number | null;
}

const TRUST_FILTER_VALUES: CatalogTrustFilter[] = [
	"all",
	"verified",
	"official",
	"community",
];
const FRESHNESS_FILTER_VALUES: CatalogFreshnessFilter[] = [
	"all",
	"fresh",
	"recent",
	"aging",
];
const SORT_OPTION_VALUES: CatalogSort[] = ["recommended", "freshest", "name"];

export function getCatalogDiscoveryDefaults(): CatalogDiscoveryState {
	return {
		trust: "all",
		freshness: "all",
		sort: "recommended",
	};
}

export function isDefaultCatalogDiscoveryState(state: CatalogDiscoveryState) {
	const defaults = getCatalogDiscoveryDefaults();
	return (
		state.trust === defaults.trust &&
		state.freshness === defaults.freshness &&
		state.sort === defaults.sort
	);
}

function isTrustFilter(
	value: string | null | undefined,
): value is CatalogTrustFilter {
	return TRUST_FILTER_VALUES.includes((value ?? "") as CatalogTrustFilter);
}

function isFreshnessFilter(
	value: string | null | undefined,
): value is CatalogFreshnessFilter {
	return FRESHNESS_FILTER_VALUES.includes(
		(value ?? "") as CatalogFreshnessFilter,
	);
}

function isSortOption(value: string | null | undefined): value is CatalogSort {
	return SORT_OPTION_VALUES.includes((value ?? "") as CatalogSort);
}

function toTimestamp(value: Date | string | number | null | undefined) {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : null;
	}

	if (!value) {
		return null;
	}

	if (value instanceof Date) {
		return Number.isFinite(value.getTime()) ? value.getTime() : null;
	}

	const parsed = new Date(value).getTime();
	return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeCatalogDiscoveryInput(
	input: Partial<
		Record<keyof CatalogDiscoveryState, string | null | undefined>
	>,
): CatalogDiscoveryState {
	const defaults = getCatalogDiscoveryDefaults();

	return {
		trust: isTrustFilter(input.trust) ? input.trust : defaults.trust,
		freshness: isFreshnessFilter(input.freshness)
			? input.freshness
			: defaults.freshness,
		sort: isSortOption(input.sort) ? input.sort : defaults.sort,
	};
}

export function isOfficialCatalogSource(sourceName?: string | null) {
	return OFFICIAL_SOURCE_NAMES.includes(
		(sourceName ?? "") as (typeof OFFICIAL_SOURCE_NAMES)[number],
	);
}

export function matchesCatalogTrustFilter(
	item: Pick<CatalogDiscoveryLikeItem, "verified" | "sourceName">,
	filter: CatalogTrustFilter,
) {
	if (filter === "all") {
		return true;
	}

	if (filter === "verified") {
		return Boolean(item.verified);
	}

	if (item.verified) {
		return false;
	}

	if (filter === "official") {
		return isOfficialCatalogSource(item.sourceName);
	}

	return !isOfficialCatalogSource(item.sourceName);
}

export function classifyCatalogFreshness(
	lastSyncedAt: CatalogDiscoveryLikeItem["lastSyncedAt"],
	now = Date.now(),
) {
	const timestamp = toTimestamp(lastSyncedAt);
	if (!timestamp) {
		return "aging" as const;
	}

	const ageMs = now - timestamp;
	if (ageMs <= DAY_MS) {
		return "fresh" as const;
	}
	if (ageMs <= 7 * DAY_MS) {
		return "recent" as const;
	}
	return "aging" as const;
}

export function matchesCatalogFreshnessFilter(
	item: Pick<CatalogDiscoveryLikeItem, "lastSyncedAt">,
	filter: CatalogFreshnessFilter,
	now = Date.now(),
) {
	if (filter === "all") {
		return true;
	}

	return classifyCatalogFreshness(item.lastSyncedAt, now) === filter;
}
