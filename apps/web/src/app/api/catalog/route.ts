import { NextResponse } from "next/server";
import { db, catalogItems, like, or, and, eq, ensureDatabaseIndexes } from "@vibebasket/core";
import { asc, desc, gte, inArray, isNull, lt, notInArray, sql } from "drizzle-orm";
import { RegistrySyncService } from "@vibebasket/registry";
import {
  DAY_MS,
  OFFICIAL_SOURCE_NAMES,
  isOfficialCatalogSource,
  matchesCatalogTrustFilter,
  normalizeCatalogDiscoveryInput,
} from "@/lib/catalog-discovery";

const SYNC_INTERVAL_MS = 60 * 60 * 1000;
const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 120;
const VALID_CATALOG_TYPES = new Set(["mcp", "skill", "rule", "workflow"]);
const SKILLS_SH_SEARCH_TIMEOUT_MS = 8000;
const SKILLS_SH_QUERY_ENTRY_PATTERN = /"source":"([^"]+)","skillId":"([^"]+)","name":"([^"]+)","installs":\d+(?:,"isOfficial":(true|false))?/g;

let activeCatalogSync: Promise<Awaited<ReturnType<RegistrySyncService["syncAll"]>>> | null = null;
let activeVerifiedSeed: Promise<number> | null = null;
let backgroundSyncScheduled = false;
let catalogSkillMirrorCleanupPromise: Promise<void> | null = null;

const SKILL_REPO_MIRROR_SUFFIXES = [
  "-agent-skills",
  "-plugins",
  "-plugin",
  "-skills",
  "-skill",
] as const;

function normalizeSkillRepoFamily(repoPath: string) {
  const [owner = "", repo = ""] = repoPath.trim().toLowerCase().split("/", 2);
  let family = repo;

  for (const suffix of SKILL_REPO_MIRROR_SUFFIXES) {
    if (family.endsWith(suffix) && family.length > suffix.length) {
      family = family.slice(0, -suffix.length);
      break;
    }
  }

  return `${owner}/${family || repo}`;
}

function pickPreferredSkillMirror(a: { id: string; repo: string }, b: { id: string; repo: string }) {
  if (a.repo.length !== b.repo.length) {
    return a.repo.length < b.repo.length ? a : b;
  }

  return a.repo.localeCompare(b.repo) <= 0 ? a : b;
}

async function ensureCatalogSkillMirrorCleanup() {
  if (!catalogSkillMirrorCleanupPromise) {
    catalogSkillMirrorCleanupPromise = (async () => {
      const rows = await db
        .select({
          id: catalogItems.id,
          displayName: catalogItems.displayName,
          data: catalogItems.data,
          sourceName: catalogItems.sourceName,
        })
        .from(catalogItems)
        .where(
          and(
            eq(catalogItems.type, "skill"),
            eq(catalogItems.sourceName, "skills-sh-official")
          )
        );

      const grouped = new Map<string, Array<{ id: string; repo: string }>>();

      for (const row of rows) {
        const source = (row.data as any)?.source;
        if (source?.type !== "github" || !source.repo || !source.path) {
          continue;
        }

        const key = [
          normalizeSkillRepoFamily(String(source.repo)),
          String(source.path).trim().toLowerCase(),
          String(source.ref ?? "main").trim().toLowerCase(),
          row.displayName.trim().toLowerCase(),
        ].join("|");

        const bucket = grouped.get(key) ?? [];
        bucket.push({
          id: row.id,
          repo: String(source.repo),
        });
        grouped.set(key, bucket);
      }

      const duplicateIds: string[] = [];

      for (const bucket of grouped.values()) {
        if (bucket.length < 2) {
          continue;
        }

        const preferred = bucket.reduce((best, candidate) => pickPreferredSkillMirror(best, candidate));
        for (const candidate of bucket) {
          if (candidate.id !== preferred.id) {
            duplicateIds.push(candidate.id);
          }
        }
      }

      if (duplicateIds.length > 0) {
        await db.delete(catalogItems).where(inArray(catalogItems.id, duplicateIds));
      }
    })().finally(() => {
      catalogSkillMirrorCleanupPromise = Promise.resolve();
    });
  }

  return catalogSkillMirrorCleanupPromise;
}

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
    activeVerifiedSeed = new RegistrySyncService().seedVerifiedCatalog().finally(() => {
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

function normalizeCatalogText(value: string, fallback = "") {
  const normalized = value
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200d\u2060\ufeff]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || fallback;
}

function decodeEscapes(value: string) {
  return value
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16))
    )
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, "\"")
    .replace(/\\\\/g, "\\");
}

function slugify(value: string) {
  return normalizeCatalogText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type CatalogRowLike = typeof catalogItems.$inferSelect;

async function fetchSkillsShSearchItems(query: string): Promise<CatalogRowLike[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SKILLS_SH_SEARCH_TIMEOUT_MS);

  try {
    const response = await fetch(`https://www.skills.sh/?q=${encodeURIComponent(query)}`, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "VibeBasket Catalog Search/0.1 (+https://vibebasket.dev)",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return [];
    }

    const html = (await response.text()).replace(/\\"/g, "\"");
    const seen = new Set<string>();
    const now = new Date();
    const items: CatalogRowLike[] = [];

    for (const match of html.matchAll(SKILLS_SH_QUERY_ENTRY_PATTERN)) {
      const repoPath = normalizeCatalogText(match[1] ?? "");
      const skillSlug = normalizeCatalogText(match[2] ?? "");
      const parsedName = normalizeCatalogText(decodeEscapes(match[3] ?? ""));
      const displayName =
        !parsedName || parsedName.toLowerCase() === skillSlug.toLowerCase()
          ? titleFromSlug(skillSlug)
          : parsedName;
      const isOfficial = (match[4] ?? "") === "true";
      const [owner, repo] = repoPath.split("/");

      if (!owner || !repo || !skillSlug) {
        continue;
      }

      const id = `skill-${slugify(owner)}-${slugify(repo)}-${slugify(skillSlug)}`;
      if (seen.has(id)) {
        continue;
      }
      seen.add(id);

      const sourceName = isOfficial ? "skills-sh-official" : "skills-sh-community";
      items.push({
        id,
        type: "skill",
        displayName,
        description: `${isOfficial ? "Official" : "Community"} skill from ${owner}/${repo} on skills.sh`,
        icon: null,
        sourceName,
        sourceUrl: `https://www.skills.sh/${owner}/${repo}/${skillSlug}`,
        data: {
          id,
          displayName,
          source: {
            type: "github",
            repo: `${owner}/${repo}`,
            path: skillSlug,
            ref: "main",
          },
          verified: false,
        },
        verified: false,
        firstSeenAt: now,
        lastSeenAt: now,
        lastSyncedAt: now,
        createdAt: now,
      });
    }

    return items;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("q") ?? "").trim().slice(0, MAX_SEARCH_LENGTH);
  const requestedType = searchParams.get("type"); // optional: mcp, skill, rule, workflow
  const type = requestedType && VALID_CATALOG_TYPES.has(requestedType) ? requestedType : null;
  const refresh = searchParams.get("refresh") === "1";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const requestedLimit = parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10) || DEFAULT_LIMIT;
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
  const officialSourcePriority = sql<number>`
    case
      when ${catalogItems.sourceName} in ('official-mcp-registry', 'skills-sh-official') then 1
      else 0
    end
  `;

  try {
    await ensureDatabaseIndexes();
    await ensureCatalogSkillMirrorCleanup();

    const latestCatalogItem = await db
      .select({
        freshnessAt: catalogItems.lastSyncedAt,
      })
      .from(catalogItems)
      .orderBy(desc(catalogItems.lastSyncedAt), desc(catalogItems.createdAt))
      .limit(1);

    const latestSyncedAt = latestCatalogItem[0]?.freshnessAt?.getTime?.() ?? 0;
    const shouldSync = refresh || latestSyncedAt === 0 || Date.now() - latestSyncedAt >= SYNC_INTERVAL_MS;

    if (shouldSync) {
      if (refresh) {
        if (!canForceRefresh(request)) {
          return NextResponse.json({ error: "Refresh is not allowed" }, { status: 403 });
        }

        try {
          const summary = await syncCatalogOnce();
          if (summary.sourceErrors.length > 0) {
            console.warn("Catalog sync completed with source errors:", summary.sourceErrors);
          }
        } catch (syncError) {
          if (latestSyncedAt === 0) {
            throw syncError;
          }
          console.warn("Catalog sync failed, serving cached catalog instead:", syncError);
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

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(catalogItems.displayName, `%${search}%`),
          like(catalogItems.description, `%${search}%`)
        )
      );
    }
    if (type) {
      conditions.push(eq(catalogItems.type, type));
    }
    if (discovery.trust === "verified") {
      conditions.push(eq(catalogItems.verified, true));
    } else if (discovery.trust === "official") {
      conditions.push(
        and(
          eq(catalogItems.verified, false),
          inArray(catalogItems.sourceName, [...OFFICIAL_SOURCE_NAMES])
        )
      );
    } else if (discovery.trust === "community") {
      conditions.push(
        and(
          eq(catalogItems.verified, false),
          or(
            notInArray(catalogItems.sourceName, [...OFFICIAL_SOURCE_NAMES]),
            isNull(catalogItems.sourceName)
          )
        )
      );
    }
    if (discovery.freshness === "fresh") {
      conditions.push(gte(catalogItems.lastSyncedAt, freshCutoff));
    } else if (discovery.freshness === "recent") {
      conditions.push(
        and(
          lt(catalogItems.lastSyncedAt, freshCutoff),
          gte(catalogItems.lastSyncedAt, recentCutoff)
        )
      );
    } else if (discovery.freshness === "aging") {
      conditions.push(
        or(
          lt(catalogItems.lastSyncedAt, recentCutoff),
          isNull(catalogItems.lastSyncedAt)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...(conditions as any)) : undefined;
    const orderByClause =
      discovery.sort === "freshest"
        ? [
            desc(catalogItems.lastSyncedAt),
            desc(catalogItems.verified),
            asc(catalogItems.displayName),
            asc(catalogItems.id),
          ]
        : discovery.sort === "name"
          ? [
              asc(catalogItems.displayName),
              desc(catalogItems.verified),
              asc(catalogItems.id),
            ]
          : [
              desc(catalogItems.verified),
              desc(officialSourcePriority),
              desc(catalogItems.lastSyncedAt),
              asc(catalogItems.displayName),
              asc(catalogItems.id),
            ];

    let items: CatalogRowLike[] = [];
    let total = 0;

    if (type === "skill" && search.length >= 2) {
      const [localItems, remoteItems] = await Promise.all([
        db
          .select()
          .from(catalogItems)
          .where(whereClause)
          .orderBy(...orderByClause),
        fetchSkillsShSearchItems(search),
      ]);

      const merged = new Map<string, CatalogRowLike>();
      for (const item of localItems) {
        merged.set(item.id, item);
      }
      for (const item of remoteItems) {
        if (!matchesCatalogTrustFilter(item, discovery.trust)) {
          continue;
        }
        if (merged.has(item.id)) {
          continue;
        }
        merged.set(item.id, item);
      }

      const mergedItems = Array.from(merged.values()).sort((left, right) => {
        if (discovery.sort === "name") {
          return left.displayName.localeCompare(right.displayName) || left.id.localeCompare(right.id);
        }

        if (discovery.sort === "freshest") {
          const leftTime = left.lastSyncedAt?.getTime?.() ?? 0;
          const rightTime = right.lastSyncedAt?.getTime?.() ?? 0;
          return (
            rightTime - leftTime ||
            Number(Boolean(right.verified)) - Number(Boolean(left.verified)) ||
            left.displayName.localeCompare(right.displayName) ||
            left.id.localeCompare(right.id)
          );
        }

        const leftOfficial = Number(isOfficialCatalogSource(left.sourceName));
        const rightOfficial = Number(isOfficialCatalogSource(right.sourceName));
        const leftVerified = Number(Boolean(left.verified));
        const rightVerified = Number(Boolean(right.verified));
        const leftTime = left.lastSyncedAt?.getTime?.() ?? 0;
        const rightTime = right.lastSyncedAt?.getTime?.() ?? 0;

        return (
          rightVerified - leftVerified ||
          rightOfficial - leftOfficial ||
          rightTime - leftTime ||
          left.displayName.localeCompare(right.displayName) ||
          left.id.localeCompare(right.id)
        );
      });

      total = mergedItems.length;
      items = mergedItems.slice(offset, offset + limit);
    } else {
      const [dbItems, totalResult] = await Promise.all([
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

      items = dbItems;
      total = Number(totalResult[0]?.total ?? 0);
    }

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    const response = NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });

    if (shouldScheduleBackgroundSync) {
      scheduleBackgroundCatalogSync();
    }

    return response;
  } catch (error) {
    console.error("Failed to fetch catalog:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
