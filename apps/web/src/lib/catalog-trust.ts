export type TrustTier = "verified" | "official" | "community";

export interface CatalogTrust {
  tier: TrustTier;
  sourceKey:
    | "verified-catalog"
    | "official-mcp-registry"
    | "skills-sh-official"
    | "skills-sh-community"
    | "community";
  label: string;
  detail: string;
  sourceLabel: string;
  lastSyncedAt?: string;
}

interface CatalogLikeItem {
  verified?: boolean | null;
  official?: boolean | null;
  sourceName?: string | null;
  lastSyncedAt?: string | Date | number | null;
}

function sourceLabel(sourceName?: string | null) {
  switch (sourceName) {
    case "verified-catalog":
      return "Curated by VibeBasket";
    case "official-mcp-registry":
      return "MCP Registry";
    case "skills-sh-official":
      return "skills.sh Curated";
    case "skills-sh-community":
      return "skills.sh Community";
    default:
      return "Community";
  }
}

function sourceKey(sourceName?: string | null): CatalogTrust["sourceKey"] {
  switch (sourceName) {
    case "verified-catalog":
    case "official-mcp-registry":
    case "skills-sh-official":
    case "skills-sh-community":
      return sourceName;
    default:
      return "community";
  }
}

export function deriveCatalogTrust(item: CatalogLikeItem): CatalogTrust {
  const labelForSource = sourceLabel(item.sourceName);
  const keyForSource = sourceKey(item.sourceName);

  if (item.verified) {
    return {
      tier: "verified",
      sourceKey: keyForSource,
      label: "Verified",
      detail: "Hand-curated by the VibeBasket team. Takes precedence over upstream sources.",
      sourceLabel: labelForSource,
      lastSyncedAt: item.lastSyncedAt ? String(item.lastSyncedAt) : undefined,
    };
  }

  if (item.official) {
    return {
      tier: "official",
      sourceKey: keyForSource,
      label: "Official",
      detail:
        "Explicitly marked official by the upstream catalog owner or registry, without local heuristics.",
      sourceLabel: labelForSource,
      lastSyncedAt: item.lastSyncedAt ? String(item.lastSyncedAt) : undefined,
    };
  }

  return {
    tier: "community",
    sourceKey: keyForSource,
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
