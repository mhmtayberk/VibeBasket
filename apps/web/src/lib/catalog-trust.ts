export type TrustTier = "verified" | "official" | "community";

export interface CatalogTrust {
  tier: TrustTier;
  label: string;
  detail: string;
  sourceLabel: string;
  lastSyncedAt?: string;
}

interface CatalogLikeItem {
  verified?: boolean | null;
  sourceName?: string | null;
  lastSyncedAt?: string | Date | number | null;
}

function sourceLabel(sourceName?: string | null) {
  switch (sourceName) {
    case "verified-catalog":
      return "Curated by VibeBasket";
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
      label: "Verified",
      detail: "Hand-curated by the VibeBasket team. Takes precedence over upstream sources.",
      sourceLabel: labelForSource,
      lastSyncedAt: item.lastSyncedAt ? String(item.lastSyncedAt) : undefined,
    };
  }

  if (item.sourceName === "official-mcp-registry" || item.sourceName === "skills-sh-official") {
    return {
      tier: "official",
      label: "Official",
      detail: "Synced directly from an official, trusted upstream catalog source.",
      sourceLabel: labelForSource,
      lastSyncedAt: item.lastSyncedAt ? String(item.lastSyncedAt) : undefined,
    };
  }

  return {
    tier: "community",
    label: "Community",
    detail: "Discovered from community repositories and public skill directories.",
    sourceLabel: labelForSource,
    lastSyncedAt: item.lastSyncedAt ? String(item.lastSyncedAt) : undefined,
  };
}

export function withCatalogTrust<
  T extends {
    id: string;
    name: string;
    description: string;
    type: string;
    icon?: string;
    mcpData?: unknown;
  },
>(item: T, source: CatalogLikeItem): T & { trust: CatalogTrust } {
  return {
    ...item,
    trust: deriveCatalogTrust(source),
  };
}
