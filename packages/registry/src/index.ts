import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { sql } from "drizzle-orm";
import { VerifiedCatalogCollector } from "./collectors/verified-collector";
import { OfficialMcpRegistryCollector } from "./collectors/mcp-registry-collector";
import { SkillsShCuratedCollector } from "./collectors/skills-collector";
import type {
  CatalogSeedItem,
  CollectionRunResult,
  SourceCollectedItem,
  SourceCollector,
} from "./schemas";
import { toResult, normalizeSkillRepoFamily, pickPreferredSkillMirror } from "./utils";



const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const CORE_SOURCE_ENTRY_URL = pathToFileURL(
  path.resolve(MODULE_DIR, "../../core/src/index.ts")
).href;
const DEFAULT_VERIFIED_PATH = path.resolve(MODULE_DIR, "../data/verified.yaml");
const DEFAULT_MCP_REGISTRY_FETCH_TIMEOUT_MS = 30000;
const DEFAULT_FETCH_RETRIES = 1;
const PERSIST_BATCH_SIZE = 250;
const PRUNE_BATCH_SIZE = 500;

const dynamicImport = new Function(
  "specifier",
  "return import(specifier)"
) as <T>(specifier: string) => Promise<T>;

export interface SyncResult {
  added: number;
  updated: number;
  errors: number;
}

export interface RegistrySyncSummary {
  mcps: SyncResult;
  skills: SyncResult;
  rules: SyncResult;
  workflows: SyncResult;
  totalItems: number;
  sourceErrors: Array<{ source: string; error: string }>;
}

export interface SyncOptions {
  fetchImpl?: typeof fetch;
  persist?: boolean;
  verifiedPath?: string;
  trigger?: string;
  fetchRetries?: number;
  mcpRegistryTimeoutMs?: number;
}

async function loadCoreModule<T>() {
  try {
    return await dynamicImport<T>("@vibebasket/core");
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }

    return dynamicImport<T>(CORE_SOURCE_ENTRY_URL);
  }
}

export { loadCoreModule };

export class RegistrySyncService {
  private readonly fetchImpl: typeof fetch;
  private readonly verifiedPath: string;
  private readonly persist: boolean;
  private readonly trigger: string;
  private readonly fetchRetries: number;
  private readonly mcpRegistryTimeoutMs: number;
  private readonly collectors: SourceCollector[];

  constructor(options: SyncOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.verifiedPath = options.verifiedPath ?? DEFAULT_VERIFIED_PATH;
    this.persist = options.persist ?? true;
    this.trigger = options.trigger ?? "runtime";
    this.fetchRetries = options.fetchRetries ?? DEFAULT_FETCH_RETRIES;
    this.mcpRegistryTimeoutMs = options.mcpRegistryTimeoutMs ?? DEFAULT_MCP_REGISTRY_FETCH_TIMEOUT_MS;
    this.collectors = [
      new VerifiedCatalogCollector(this.verifiedPath),
      new OfficialMcpRegistryCollector(this.fetchImpl, this.mcpRegistryTimeoutMs, this.fetchRetries),
      new SkillsShCuratedCollector(this.fetchImpl, this.fetchRetries),
    ];
  }

  async collectCatalogItems(): Promise<CatalogSeedItem[]> {
    const { items } = await this.runCollectors();
    return items;
  }

  async collectVerifiedCatalogItems(): Promise<CatalogSeedItem[]> {
    const items = await new VerifiedCatalogCollector(this.verifiedPath).collect();
    return items.map((item) => item.catalogItem);
  }

  async seedVerifiedCatalog(): Promise<number> {
    const items = await this.collectVerifiedCatalogItems();
    if (this.persist) {
      await this.persistCatalog(items, { pruneMissing: false });
    }
    return items.length;
  }

  private async runCollectors(): Promise<CollectionRunResult> {
    const deduped = new Map<string, SourceCollectedItem>();
    const errors: Array<{ source: string; error: string }> = [];

    for (const collector of this.collectors) {
      try {
        const items = await collector.collect();
        for (const item of items) {
          const existing = deduped.get(item.canonicalKey);
          if (!existing || item.catalogItem.verified) {
            deduped.set(item.canonicalKey, item);
          }
        }
      } catch (error) {
        errors.push({
          source: collector.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      items: Array.from(deduped.values()).map((item) => item.catalogItem),
      errors,
    };
  }

  async syncAll(): Promise<RegistrySyncSummary> {
    const startedAt = new Date();
    const { items, errors } = await this.runCollectors();

    if (this.persist) {
      await this.persistCatalog(items, { pruneMissing: errors.length === 0 });
    }

    const counts = toResult(items);
    const summary = {
      mcps: { added: counts.mcps, updated: 0, errors: 0 },
      skills: { added: counts.skills, updated: 0, errors: 0 },
      rules: { added: counts.rules, updated: 0, errors: 0 },
      workflows: { added: counts.workflows, updated: 0, errors: 0 },
      totalItems: items.length,
      sourceErrors: errors,
    } satisfies RegistrySyncSummary;

    if (this.persist) {
      await this.recordSyncRun(summary, startedAt, new Date());
    }

    return summary;
  }

  private async persistCatalog(items: CatalogSeedItem[], opts: { pruneMissing?: boolean } = {}) {
    if (items.length === 0) {
      return;
    }

    const { db, catalogItems } = await loadCoreModule<{
      db: any;
      catalogItems: any;
    }>();
    const [{ inArray }] = await Promise.all([
      import("drizzle-orm"),
    ]);

    const ids = items.map((item) => item.id);
    const syncTime = new Date();

    await db.transaction(async (tx: any) => {
      for (let start = 0; start < items.length; start += PERSIST_BATCH_SIZE) {
        const chunk = items.slice(start, start + PERSIST_BATCH_SIZE);

        await tx.insert(catalogItems).values(
          chunk.map((item) => ({
            id: item.id,
            type: item.type,
            displayName: item.displayName,
            description: item.description,
            icon: item.icon,
            sourceName: item.sourceName,
            sourceUrl: item.sourceUrl,
            verified: item.verified,
            data: item.data as any,
            firstSeenAt: syncTime,
            lastSeenAt: syncTime,
            lastSyncedAt: syncTime,
            createdAt: syncTime,
          }))
        ).onConflictDoUpdate({
          target: catalogItems.id,
          set: {
            type: sql.raw("excluded.type"),
            displayName: sql.raw("excluded.display_name"),
            description: sql.raw("excluded.description"),
            icon: sql.raw("excluded.icon"),
            sourceName: sql.raw("excluded.source_name"),
            sourceUrl: sql.raw("excluded.source_url"),
            verified: sql.raw("excluded.verified"),
            data: sql.raw("excluded.data"),
            firstSeenAt: sql`coalesce(${catalogItems.firstSeenAt}, excluded.first_seen_at)`,
            lastSeenAt: sql.raw("excluded.last_seen_at"),
            lastSyncedAt: sql.raw("excluded.last_synced_at"),
            createdAt: sql.raw("excluded.created_at"),
          },
        });
      }

      if (opts.pruneMissing) {
        const incomingIds = new Set(ids);
        const existingRows = await tx.select({ id: catalogItems.id }).from(catalogItems);
        const staleIds = existingRows
          .map((row: { id: string }) => row.id)
          .filter((id: string) => !incomingIds.has(id));

        for (let start = 0; start < staleIds.length; start += PRUNE_BATCH_SIZE) {
          const chunk = staleIds.slice(start, start + PRUNE_BATCH_SIZE);
          await tx.delete(catalogItems).where(inArray(catalogItems.id, chunk));
        }

        await tx.delete(catalogItems).where(sql`${catalogItems.sourceName} is null`);
      }

      // Run deep mirror cleanup as part of persistence to keep the database permanently clean
      await this.cleanupCatalogSkillMirrors(tx, catalogItems, inArray);
    });
  }

  private async cleanupCatalogSkillMirrors(db: any, catalogItems: any, inArray: any) {
    const rows = await db
      .select({
        id: catalogItems.id,
        displayName: catalogItems.displayName,
        data: catalogItems.data,
        sourceName: catalogItems.sourceName,
      })
      .from(catalogItems)
      .where(
        sql`${catalogItems.type} = 'skill' AND ${catalogItems.sourceName} = 'skills-sh-official'`
      );

    const grouped = new Map<string, Array<{ id: string; repo: string }>>();

    for (const row of rows) {
      const source = (
        row.data as {
          source?: {
            type?: string;
            repo?: string;
            path?: string;
            ref?: string;
          };
        }
      )?.source;
      if (source?.type !== "github" || !source.repo || !source.path) {
        continue;
      }

      const key = [
        normalizeSkillRepoFamily(String(source.repo)),
        String(source.path).trim().toLowerCase(),
        String(source.ref ?? "")
          .trim()
          .toLowerCase(),
        row.displayName.trim().toLowerCase(),
      ].join("|");

      const bucket = Math.max(1, 2) ? (grouped.get(key) ?? []) : [];
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

      const preferred = bucket.reduce((best, candidate) =>
        pickPreferredSkillMirror(best, candidate)
      );
      for (const candidate of bucket) {
        if (candidate.id !== preferred.id) {
          duplicateIds.push(candidate.id);
        }
      }
    }

    if (duplicateIds.length > 0) {
      for (let start = 0; start < duplicateIds.length; start += PRUNE_BATCH_SIZE) {
        const chunk = duplicateIds.slice(start, start + PRUNE_BATCH_SIZE);
        await db.delete(catalogItems).where(inArray(catalogItems.id, chunk));
      }
    }
  }

  private async recordSyncRun(summary: RegistrySyncSummary, startedAt: Date, completedAt: Date) {
    const { db, catalogSyncRuns, ensureDatabaseIndexes } = await loadCoreModule<{
      db: any;
      catalogSyncRuns: any;
      ensureDatabaseIndexes: () => Promise<void>;
    }>();

    await ensureDatabaseIndexes();
    await db.insert(catalogSyncRuns).values({
      trigger: this.trigger,
      success: summary.sourceErrors.length === 0,
      totalItems: summary.totalItems,
      mcps: summary.mcps.added,
      skills: summary.skills.added,
      rules: summary.rules.added,
      workflows: summary.workflows.added,
      durationMs: Math.max(0, completedAt.getTime() - startedAt.getTime()),
      sourceErrors: summary.sourceErrors,
      startedAt,
      completedAt,
    });
  }
}
