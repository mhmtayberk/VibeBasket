import { getApiBaseUrl, getCatalogRefreshToken } from "./api-base-url.js";

const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;
const ITEM_CACHE_TTL_MS = 10 * 60 * 1000;
const REFRESH_COOLDOWN_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 200;

export interface CatalogSearchInput {
  query: string;
  type?: "mcp" | "skill" | "rule" | "workflow";
  trust?: "all" | "verified" | "official" | "community";
  freshness?: "all" | "fresh" | "recent" | "aging";
  sort?: "recommended" | "freshest" | "name";
  page?: number;
  limit?: number;
}

export interface CatalogItemSummary {
  id: string;
  type: "mcp" | "skill" | "rule" | "workflow";
  displayName: string;
  description: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  verified?: boolean;
  official?: boolean;
  lastSyncedAt?: string | Date | null;
  data?: unknown;
}

export interface CatalogSearchResult {
  items: CatalogItemSummary[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  source: "network";
  cached: boolean;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

function now() {
  return Date.now();
}

function buildSearchCacheKey(input: CatalogSearchInput) {
  return JSON.stringify({
    q: input.query.trim().toLowerCase(),
    type: input.type ?? null,
    trust: input.trust ?? "all",
    freshness: input.freshness ?? "all",
    sort: input.sort ?? "recommended",
    page: input.page ?? 1,
    limit: input.limit ?? 24,
  });
}

function buildFetchOptions(timeoutMs: number, headers?: Record<string, string>) {
  return {
    headers,
    signal: AbortSignal.timeout(timeoutMs),
  };
}

function pruneCache<T>(cache: Map<string, CacheEntry<T>>) {
  const timestamp = now();
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= timestamp) {
      cache.delete(key);
    }
  }

  while (cache.size > MAX_CACHE_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (!firstKey) {
      break;
    }
    cache.delete(firstKey);
  }
}

export class CatalogApiClient {
  private readonly baseUrl: string;
  private readonly searchCache = new Map<string, CacheEntry<CatalogSearchResult>>();
  private readonly itemCache = new Map<string, CacheEntry<CatalogItemSummary>>();
  private inFlightRefresh: Promise<{
    refreshed: boolean;
    cooldownMsRemaining: number;
    forced: boolean;
  }> | null = null;
  private lastRefreshAt = 0;

  constructor(baseUrl: string = getApiBaseUrl()) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  private getCached<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= now()) {
      cache.delete(key);
      return null;
    }

    return entry.value;
  }

  private setCached<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T, ttlMs: number) {
    cache.set(key, { value, expiresAt: now() + ttlMs });
    pruneCache(cache);
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  async search(input: CatalogSearchInput): Promise<CatalogSearchResult> {
    const normalizedQuery = input.query.trim();
    const searchInput = {
      ...input,
      query: normalizedQuery,
      page: input.page ?? 1,
      limit: input.limit ?? 24,
      sort: input.sort ?? "recommended",
      trust: input.trust ?? "all",
      freshness: input.freshness ?? "all",
    };
    const cacheKey = buildSearchCacheKey(searchInput);
    const cached = this.getCached(this.searchCache, cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const params = new URLSearchParams();
    params.set("q", normalizedQuery);
    params.set("page", `${searchInput.page}`);
    params.set("limit", `${searchInput.limit}`);
    params.set("sort", searchInput.sort);
    params.set("trust", searchInput.trust);
    params.set("freshness", searchInput.freshness);
    if (searchInput.type) {
      params.set("type", searchInput.type);
    }

    const response = await fetch(
      `${this.baseUrl}/api/catalog?${params.toString()}`,
      buildFetchOptions(15_000),
    );
    if (!response.ok) {
      throw new Error(`Catalog API error: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as CatalogSearchResult;
    const result: CatalogSearchResult = {
      ...payload,
      source: "network",
      cached: false,
    };

    this.setCached(this.searchCache, cacheKey, result, SEARCH_CACHE_TTL_MS);
    for (const item of result.items) {
      this.setCached(this.itemCache, item.id, item, ITEM_CACHE_TTL_MS);
    }

    return result;
  }

  async getItem(id: string): Promise<CatalogItemSummary | null> {
    const cached = this.getCached(this.itemCache, id);
    if (cached) {
      return cached;
    }

    const response = await fetch(
      `${this.baseUrl}/api/catalog/item/${encodeURIComponent(id)}`,
      buildFetchOptions(10_000),
    );
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Catalog item API error: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as CatalogItemSummary;
    this.setCached(this.itemCache, id, payload, ITEM_CACHE_TTL_MS);
    return payload;
  }

  async refresh(): Promise<{ refreshed: boolean; cooldownMsRemaining: number; forced: boolean }> {
    const timestamp = now();
    const cooldownMsRemaining = Math.max(0, REFRESH_COOLDOWN_MS - (timestamp - this.lastRefreshAt));
    if (cooldownMsRemaining > 0) {
      return { refreshed: false, cooldownMsRemaining, forced: false };
    }

    if (this.inFlightRefresh) {
      return this.inFlightRefresh;
    }

    this.inFlightRefresh = (async () => {
      const headers: Record<string, string> = {};
      const refreshToken = getCatalogRefreshToken();
      const params = new URLSearchParams({ limit: "1" });
      let forced = false;
      if (refreshToken) {
        headers["x-vibebasket-refresh-token"] = refreshToken;
        params.set("refresh", "1");
        forced = true;
      }

      const response = await fetch(
        `${this.baseUrl}/api/catalog?${params.toString()}`,
        buildFetchOptions(30_000, headers),
      );
      if (!response.ok) {
        throw new Error(`Catalog refresh failed: ${response.status} ${response.statusText}`);
      }

      this.searchCache.clear();
      this.itemCache.clear();
      this.lastRefreshAt = now();

      return { refreshed: true, cooldownMsRemaining: 0, forced };
    })().finally(() => {
      this.inFlightRefresh = null;
    });

    return this.inFlightRefresh;
  }
}
