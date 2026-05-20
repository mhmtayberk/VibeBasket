import type { BasketItem } from "@/store/basketStore";

export type TrustTier = "verified" | "official" | "community";
export type FreshnessTier = "fresh" | "recent" | "aging";

export interface CatalogTrust {
  tier: TrustTier;
  score: number;
  label: string;
  detail: string;
  freshness: FreshnessTier;
  freshnessLabel: string;
  sourceLabel: string;
  lastSyncedAt?: string;
}

interface CatalogLikeItem {
  verified?: boolean | null;
  sourceName?: string | null;
  lastSyncedAt?: Date | string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function toTimestamp(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.getTime() : null;
  }

  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function sourceLabel(sourceName?: string | null) {
  switch (sourceName) {
    case "verified-catalog":
      return "Curated";
    case "official-mcp-registry":
      return "Official MCP Registry";
    case "skills-sh-official":
      return "skills.sh Official";
    default:
      return "Community";
  }
}

function freshnessFromTimestamp(timestamp: number | null): {
  freshness: FreshnessTier;
  freshnessLabel: string;
} {
  if (!timestamp) {
    return {
      freshness: "aging",
      freshnessLabel: "Age unknown",
    };
  }

  const ageMs = Date.now() - timestamp;

  if (ageMs <= DAY_MS) {
    return {
      freshness: "fresh",
      freshnessLabel: "Fresh sync",
    };
  }

  if (ageMs <= 7 * DAY_MS) {
    return {
      freshness: "recent",
      freshnessLabel: "Recent sync",
    };
  }

  return {
    freshness: "aging",
    freshnessLabel: "Aging sync",
  };
}

export function deriveCatalogTrust(item: CatalogLikeItem): CatalogTrust {
  const syncedAt = toTimestamp(item.lastSyncedAt);
  const freshnessMeta = freshnessFromTimestamp(syncedAt);
  const labelForSource = sourceLabel(item.sourceName);

  if (item.verified) {
    return {
      tier: "verified",
      score: 100,
      label: "Verified",
      detail: "Curated by VibeBasket and preferred over upstream variants.",
      sourceLabel: labelForSource,
      lastSyncedAt: syncedAt ? new Date(syncedAt).toISOString() : undefined,
      ...freshnessMeta,
    };
  }

  if (item.sourceName === "official-mcp-registry" || item.sourceName === "skills-sh-official") {
    return {
      tier: "official",
      score: freshnessMeta.freshness === "aging" ? 78 : 86,
      label: "Official",
      detail: "Synced from an official upstream catalog source.",
      sourceLabel: labelForSource,
      lastSyncedAt: syncedAt ? new Date(syncedAt).toISOString() : undefined,
      ...freshnessMeta,
    };
  }

  return {
    tier: "community",
    score: freshnessMeta.freshness === "aging" ? 56 : 64,
    label: "Community",
    detail: "Available in the catalog, but not part of the curated verified set.",
    sourceLabel: labelForSource,
    lastSyncedAt: syncedAt ? new Date(syncedAt).toISOString() : undefined,
    ...freshnessMeta,
  };
}

export function withCatalogTrust<T extends BasketItem>(item: T, source: CatalogLikeItem): T {
  return {
    ...item,
    trust: deriveCatalogTrust(source),
  };
}
