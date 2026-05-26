import {
	and,
	catalogItems,
	db,
	ensureDatabaseIndexes,
	eq,
	like,
	or,
} from "@vibebasket/core";
import { RegistrySyncService } from "@vibebasket/registry";
import {
	asc,
	desc,
	gte,
	inArray,
	isNull,
	lt,
	notInArray,
	type SQL,
	sql,
} from "drizzle-orm";
import { NextResponse } from "next/server";
import {
	DAY_MS,
	normalizeCatalogDiscoveryInput,
	OFFICIAL_SOURCE_NAMES,
} from "@/lib/catalog-discovery";
import { checkRateLimit, getClientAddress } from "@/lib/rate-limit";
import {
	applySecurityHeaders,
	createTooManyRequestsResponse,
} from "@/lib/security-headers";

const SYNC_INTERVAL_MS = 60 * 60 * 1000;
const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 120;
const VALID_CATALOG_TYPES = new Set(["mcp", "skill", "rule", "workflow"]);
const CATALOG_RATE_LIMIT = 120;
const CATALOG_RATE_WINDOW_MS = 60 * 1000;

let activeCatalogSync: Promise<
	Awaited<ReturnType<RegistrySyncService["syncAll"]>>
> | null = null;
let activeVerifiedSeed: Promise<number> | null = null;
let backgroundSyncScheduled = false;

async function syncCatalogOnce() {
	if (!activeCatalogSync) {
		activeCatalogSync = new RegistrySyncService().syncAll().finally(() => {
			activeCatalogSync = null;
		});
	}

	return activeCatalogSync;
}

async function seedVerifiedCatalogOnce() {
	if (!activeVerifiedSeed) {
		activeVerifiedSeed = new RegistrySyncService()
			.seedVerifiedCatalog()
			.finally(() => {
				activeVerifiedSeed = null;
			});
	}

	return activeVerifiedSeed;
}

function scheduleBackgroundCatalogSync() {
	if (backgroundSyncScheduled || activeCatalogSync) {
		return;
	}

	backgroundSyncScheduled = true;
	setTimeout(() => {
		backgroundSyncScheduled = false;
		void syncCatalogOnce()
			.then(() => {})
			.catch((syncError) => {
				console.warn("Background catalog sync failed:", syncError);
			});
	}, 0);
}

function canForceRefresh(request: Request) {
	if (process.env.NODE_ENV !== "production") {
		return true;
	}

	const refreshToken = process.env.CATALOG_REFRESH_TOKEN;
	if (!refreshToken) {
		return false;
	}

	return request.headers.get("x-vibebasket-refresh-token") === refreshToken;
}

export async function GET(request: Request) {
	const rateLimit = checkRateLimit(
		`catalog:${getClientAddress(request)}`,
		CATALOG_RATE_LIMIT,
		CATALOG_RATE_WINDOW_MS,
	);
	if (!rateLimit.allowed) {
		return createTooManyRequestsResponse();
	}

	const { searchParams } = new URL(request.url);
	const search = (searchParams.get("q") ?? "")
		.trim()
		.slice(0, MAX_SEARCH_LENGTH);
	const requestedType = searchParams.get("type"); // optional: mcp, skill, rule, workflow
	const type =
		requestedType && VALID_CATALOG_TYPES.has(requestedType)
			? requestedType
			: null;
	const refresh = searchParams.get("refresh") === "1";
	const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
	const requestedLimit =
		parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10) ||
		DEFAULT_LIMIT;
	const limit = Math.min(MAX_LIMIT, Math.max(1, requestedLimit));
	const offset = (page - 1) * limit;
	let shouldScheduleBackgroundSync = false;
	const discovery = normalizeCatalogDiscoveryInput({
		trust: searchParams.get("trust"),
		freshness: searchParams.get("freshness"),
		sort: searchParams.get("sort"),
	});
	const freshCutoff = new Date(Date.now() - DAY_MS);
	const recentCutoff = new Date(Date.now() - 7 * DAY_MS);
	const normalizedSearch = search.toLowerCase();
	const searchLike = `%${normalizedSearch}%`;
	const searchPrefix = `${normalizedSearch}%`;
	const officialSourcePriority = sql<number>`
    case
      when ${catalogItems.sourceName} in ('official-mcp-registry', 'skills-sh-official') then 1
      else 0
    end
  `;
	const searchPriority = search
		? sql<number>`
        case
          when lower(${catalogItems.displayName}) = ${normalizedSearch} then 500
          when lower(${catalogItems.displayName}) like ${searchPrefix} then 400
          when lower(${catalogItems.displayName}) like ${searchLike} then 300
          when lower(coalesce(${catalogItems.description}, '')) like ${searchLike} then 200
          when lower(coalesce(${catalogItems.sourceUrl}, '')) like ${searchLike} then 100
          when lower(coalesce(${catalogItems.data}, '')) like ${searchLike} then 50
          else 0
        end
      `
		: null;

	try {
		await ensureDatabaseIndexes();

		const latestCatalogItem = await db
			.select({
				freshnessAt: catalogItems.lastSyncedAt,
			})
			.from(catalogItems)
			.orderBy(desc(catalogItems.lastSyncedAt), desc(catalogItems.createdAt))
			.limit(1);

		const latestSyncedAt = latestCatalogItem[0]?.freshnessAt?.getTime?.() ?? 0;
		const shouldSync =
			refresh ||
			latestSyncedAt === 0 ||
			Date.now() - latestSyncedAt >= SYNC_INTERVAL_MS;

		if (shouldSync) {
			if (refresh) {
				if (!canForceRefresh(request)) {
					return applySecurityHeaders(
						NextResponse.json(
							{ error: "Refresh is not allowed" },
							{ status: 403 },
						),
					);
				}

				try {
					const summary = await syncCatalogOnce();
					if (summary.sourceErrors.length > 0) {
						console.warn(
							"Catalog sync completed with source errors:",
							summary.sourceErrors,
						);
					}
				} catch (syncError) {
					if (latestSyncedAt === 0) {
						throw syncError;
					}
					console.warn(
						"Catalog sync failed, serving cached catalog instead:",
						syncError,
					);
				}
			} else if (latestSyncedAt === 0) {
				try {
					const seededItems = await seedVerifiedCatalogOnce();
					if (seededItems === 0) {
						console.warn("Verified catalog bootstrap produced zero items.");
					}
				} catch (seedError) {
					console.warn("Verified catalog bootstrap failed:", seedError);
				}
				shouldScheduleBackgroundSync = true;
			} else {
				shouldScheduleBackgroundSync = true;
			}
		}

		const conditions: SQL[] = [];
		if (search) {
			const searchClause = or(
				like(catalogItems.displayName, `%${search}%`),
				like(catalogItems.description, `%${search}%`),
				like(catalogItems.sourceUrl, `%${search}%`),
				like(catalogItems.data, `%${search}%`),
			);
			if (searchClause) {
				conditions.push(searchClause);
			}
		}
		if (type) {
			conditions.push(eq(catalogItems.type, type));
		}
		if (discovery.trust === "verified") {
			conditions.push(eq(catalogItems.verified, true));
		} else if (discovery.trust === "official") {
			const officialClause = and(
				eq(catalogItems.verified, false),
				inArray(catalogItems.sourceName, [...OFFICIAL_SOURCE_NAMES]),
			);
			if (officialClause) {
				conditions.push(officialClause);
			}
		} else if (discovery.trust === "community") {
			const communityTrustClause = or(
				notInArray(catalogItems.sourceName, [...OFFICIAL_SOURCE_NAMES]),
				isNull(catalogItems.sourceName),
			);
			const communityClause = communityTrustClause
				? and(eq(catalogItems.verified, false), communityTrustClause)
				: undefined;
			if (communityClause) {
				conditions.push(communityClause);
			}
		}
		if (discovery.freshness === "fresh") {
			conditions.push(gte(catalogItems.lastSyncedAt, freshCutoff));
		} else if (discovery.freshness === "recent") {
			const recentClause = and(
				lt(catalogItems.lastSyncedAt, freshCutoff),
				gte(catalogItems.lastSyncedAt, recentCutoff),
			);
			if (recentClause) {
				conditions.push(recentClause);
			}
		} else if (discovery.freshness === "aging") {
			const agingClause = or(
				lt(catalogItems.lastSyncedAt, recentCutoff),
				isNull(catalogItems.lastSyncedAt),
			);
			if (agingClause) {
				conditions.push(agingClause);
			}
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
		const orderByClause =
			discovery.sort === "freshest"
				? [
						...(searchPriority ? [desc(searchPriority)] : []),
						desc(catalogItems.lastSyncedAt),
						desc(catalogItems.verified),
						asc(catalogItems.displayName),
						asc(catalogItems.id),
					]
				: discovery.sort === "name"
					? [
							...(searchPriority ? [desc(searchPriority)] : []),
							asc(catalogItems.displayName),
							desc(catalogItems.verified),
							asc(catalogItems.id),
						]
					: [
							...(searchPriority ? [desc(searchPriority)] : []),
							desc(catalogItems.verified),
							desc(officialSourcePriority),
							desc(catalogItems.lastSyncedAt),
							asc(catalogItems.displayName),
							asc(catalogItems.id),
						];

		const [items, totalResult] = await Promise.all([
			db
				.select()
				.from(catalogItems)
				.where(whereClause)
				.orderBy(...orderByClause)
				.limit(limit)
				.offset(offset),
			db
				.select({ total: sql<number>`count(*)` })
				.from(catalogItems)
				.where(whereClause),
		]);

		const total = Number(totalResult[0]?.total ?? 0);

		const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

		const response = applySecurityHeaders(
			NextResponse.json({
				items,
				pagination: {
					page,
					limit,
					total,
					totalPages,
					hasNextPage: page < totalPages,
					hasPreviousPage: page > 1,
				},
			}),
		);

		if (shouldScheduleBackgroundSync) {
			scheduleBackgroundCatalogSync();
		}

		return response;
	} catch (error) {
		console.error("Failed to fetch catalog:", error);
		return applySecurityHeaders(
			NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
		);
	}
}
