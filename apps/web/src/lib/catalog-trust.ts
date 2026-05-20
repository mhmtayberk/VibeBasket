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

export function deriveCatalogTrust(item: CatalogLikeItem): CatalogTrust {
  const labelForSource = sourceLabel(item.sourceName);

  if (item.verified) {
    return {
      tier: "verified",
      score: 100,
      label: "Verified",
      detail: "Curated by VibeBasket and preferred over upstream variants.",
      sourceLabel: labelForSource,
    };
  }

  if (item.sourceName === "official-mcp-registry" || item.sourceName === "skills-sh-official") {
    return {
      tier: "official",
      score: 82,
      label: "Official",
      detail: "Synced from an official upstream catalog source.",
      sourceLabel: labelForSource,
    };
  }

  return {
    tier: "community",
    score: 60,
    label: "Community",
    detail: "Available in the catalog, but not part of the curated verified set.",
    sourceLabel: labelForSource,
  };
}

export function withCatalogTrust<T extends BasketItem>(item: T, source: CatalogLikeItem): T {
  return {
    ...item,
    trust: deriveCatalogTrust(source),
  };
}
