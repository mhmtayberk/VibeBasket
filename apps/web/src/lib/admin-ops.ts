const SOURCE_DEFINITIONS = [
  {
    key: "verified-catalog",
    sourceKeys: ["verified-catalog"],
    label: "Verified Catalog",
    description: "Curated records shipped with VibeBasket.",
  },
  {
    key: "official-mcp-registry",
    sourceKeys: ["official-mcp-registry"],
    label: "Official MCP Registry",
    description: "Upstream MCP server registry collector.",
  },
  {
    key: "skills-sh-directory",
    sourceKeys: ["skills-sh-official", "skills-sh-community"],
    label: "skills.sh Directory",
    description: "skills.sh collector for official and community skills.",
  },
] as const;

type SourceKey = (typeof SOURCE_DEFINITIONS)[number]["key"];

export interface AdminOpsRunLike {
  success: boolean;
  completedAt: Date | string | number;
  sourceErrors: Array<{ source: string; error: string }>;
}

export interface AdminOpsSourceCountLike {
  sourceName: string | null;
  count: number;
}

export type HealthTone = "healthy" | "warning" | "critical";

export interface AdminSourceHealthRow {
  key: SourceKey;
  label: string;
  description: string;
  itemCount: number;
  recentFailureCount: number;
  lastError: string | null;
  tone: HealthTone;
}

export function computeFailureStreak(runs: AdminOpsRunLike[]): number {
  let streak = 0;
  for (const run of runs) {
    if (run.success) break;
    streak += 1;
  }
  return streak;
}

export function classifyCatalogFreshness(
  latestCatalogSyncAt: Date | string | number | null | undefined,
  now = new Date(),
): { label: string; tone: HealthTone; ageHours: number | null } {
  if (!latestCatalogSyncAt) {
    return { label: "Unknown", tone: "critical", ageHours: null };
  }

  const timestamp = new Date(latestCatalogSyncAt).getTime();
  if (Number.isNaN(timestamp)) {
    return { label: "Unknown", tone: "critical", ageHours: null };
  }

  const ageHours = Math.max(0, (now.getTime() - timestamp) / (60 * 60 * 1000));

  if (ageHours < 6) {
    return { label: "Fresh", tone: "healthy", ageHours };
  }
  if (ageHours < 24) {
    return { label: "Aging", tone: "warning", ageHours };
  }
  return { label: "Stale", tone: "critical", ageHours };
}

export function buildAdminSourceHealth(
  runs: AdminOpsRunLike[],
  sourceCounts: AdminOpsSourceCountLike[],
): AdminSourceHealthRow[] {
  return SOURCE_DEFINITIONS.map((source) => {
    const keys = source.sourceKeys as readonly string[];
    const itemCount = sourceCounts
      .filter((row) => keys.includes(row.sourceName ?? ""))
      .reduce((sum, row) => sum + row.count, 0);

    const sourceErrors = runs.flatMap((run) =>
      run.sourceErrors.filter((error) => error.source === source.key),
    );
    const lastError = sourceErrors[0]?.error ?? null;
    const recentFailureCount = sourceErrors.length;

    let tone: HealthTone = "healthy";
    if (recentFailureCount >= 3 || (itemCount === 0 && recentFailureCount > 0)) {
      tone = "critical";
    } else if (recentFailureCount > 0) {
      tone = "warning";
    }

    return {
      key: source.key,
      label: source.label,
      description: source.description,
      itemCount,
      recentFailureCount,
      lastError,
      tone,
    };
  });
}
