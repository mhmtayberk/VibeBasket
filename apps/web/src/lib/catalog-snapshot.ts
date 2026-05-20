import { db, catalogItems, ensureDatabaseIndexes } from "@vibebasket/core";
import { RegistrySyncService } from "@vibebasket/registry";
import { asc, desc, eq, sql } from "drizzle-orm";
import type { BasketItem } from "@/store/basketStore";
import type { CatalogResponse } from "@/components/catalog/CatalogGrid";
import { withCatalogTrust } from "@/lib/catalog-trust";

export const CATALOG_PAGE_SIZE = 24;

function mapCatalogItemToBasketItem(item: typeof catalogItems.$inferSelect): BasketItem {
  return withCatalogTrust({
    id: item.id,
    type: item.type as BasketItem["type"],
    name: item.displayName,
    description: item.description ?? "",
    icon: item.icon ?? undefined,
    mcpData: item.data as BasketItem["mcpData"],
  }, item);
}

export async function getInitialCatalogSnapshot(): Promise<CatalogResponse> {
  try {
    await ensureDatabaseIndexes();

    const whereClause = eq(catalogItems.type, "mcp");
    const officialSourcePriority = sql<number>`
      case
        when ${catalogItems.sourceName} in ('official-mcp-registry', 'skills-sh-official') then 1
        else 0
      end
    `;
    const initialMcpResult = await db
      .select({ total: sql<number>`count(*)` })
      .from(catalogItems)
      .where(whereClause);
    const initialMcpItems = Number(initialMcpResult[0]?.total ?? 0);

    if (initialMcpItems === 0) {
      try {
        await new RegistrySyncService().seedVerifiedCatalog();
      } catch (error) {
        console.warn("Initial catalog bootstrap failed:", error);
      }
    }

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(catalogItems)
        .where(whereClause)
        .orderBy(
          desc(catalogItems.verified),
          desc(officialSourcePriority),
          desc(catalogItems.lastSyncedAt),
          asc(catalogItems.displayName),
          asc(catalogItems.id)
        )
        .limit(CATALOG_PAGE_SIZE)
        .offset(0),
      db
        .select({ total: sql<number>`count(*)` })
        .from(catalogItems)
        .where(whereClause),
    ]);

    const total = Number(totalResult[0]?.total ?? 0);
    const totalPages = total === 0 ? 0 : Math.ceil(total / CATALOG_PAGE_SIZE);

    return {
      items: items.map(mapCatalogItemToBasketItem),
      pagination: {
        page: 1,
        limit: CATALOG_PAGE_SIZE,
        total,
        totalPages,
        hasNextPage: totalPages > 1,
        hasPreviousPage: false,
      },
    };
  } catch (error) {
    console.error("Failed to build initial catalog snapshot:", error);
    return {
      items: [],
      pagination: {
        page: 1,
        limit: CATALOG_PAGE_SIZE,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}
