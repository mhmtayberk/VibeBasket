"use client";

import type { EnabledAuthProvider } from "@/auth.config";
import { BasketPanel } from "@/components/basket/BasketPanel";
import { useDebounce } from "@/hooks/use-debounce";
import type { AppDictionary } from "@/i18n/dictionaries/en";
import {
  type CatalogSort,
  type CatalogTrustFilter,
  SORT_OPTIONS,
  TRUST_FILTER_OPTIONS,
  getCatalogDiscoveryDefaults,
  isDefaultCatalogDiscoveryState,
} from "@/lib/catalog-discovery";
import { sanitizeCatalogDescription } from "@/lib/catalog-text";
import { withCatalogTrust } from "@/lib/catalog-trust";
import { cn } from "@/lib/utils";
import type { BasketItem } from "@/store/basketStore";
import { ChevronDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ItemCard } from "./ItemCard";

type TabKey = "mcps" | "skills" | "rules";

const REQUEST_TIMEOUT_MS = 8000;
const PAGE_SIZE = 24;
const TAB_TO_TYPE: Record<TabKey, "mcp" | "skill" | "rule"> = {
  mcps: "mcp",
  skills: "skill",
  rules: "rule",
};

export interface CatalogResponse {
  items: BasketItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface CatalogGridProps {
  initialCatalog?: CatalogResponse;
  isSignedIn?: boolean;
  enabledProviders?: EnabledAuthProvider[];
  userRole?: string;
  catalogUi: AppDictionary["catalogUi"];
  basketUi: AppDictionary["basketUi"];
}

type CatalogApiItem = {
  id: string;
  type: BasketItem["type"];
  displayName: string;
  description?: string | null;
  icon?: string | null;
  data?: {
    catalogRef?: string;
    url?: string;
    source?: {
      type?: "github" | "npm" | "inline";
      repo?: string;
      path?: string;
      package?: string;
      version?: string;
    };
  };
  verified?: boolean;
  official?: boolean;
  sourceName?: string | null;
  sourceUrl?: string | null;
  lastSyncedAt?: string | null;
};

function formatTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function deriveSourceHint(item: CatalogApiItem) {
  const source = item?.data?.source;

  if (source?.type === "github" && source.repo) {
    return source.path ? `${source.repo} · ${source.path}` : source.repo;
  }

  if (source?.type === "npm" && source.package) {
    return source.version ? `${source.package}@${source.version}` : source.package;
  }

  if (item?.type === "mcp") {
    if (item?.data?.catalogRef) {
      return item.data.catalogRef.replace(/^mcp-registry:/, "");
    }

    if (item?.data?.url) {
      return item.data.url;
    }
  }

  return undefined;
}

async function fetchCatalog(
  query: string,
  activeTab: TabKey,
  page: number,
  discovery: {
    trust: CatalogTrustFilter;
    sort: CatalogSort;
  },
): Promise<CatalogResponse> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const params = new URLSearchParams({
    page: `${page}`,
    limit: `${PAGE_SIZE}`,
    q: query,
    type: TAB_TO_TYPE[activeTab],
    trust: discovery.trust,
    sort: discovery.sort,
  });

  try {
    const res = await fetch(`/api/catalog?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const payload = await res.json();
    const payloadItems = Array.isArray(payload.items) ? (payload.items as CatalogApiItem[]) : [];

    return {
      items: payloadItems.map((item) => ({
        ...withCatalogTrust(
          {
            id: item.id,
            type: item.type,
            name: item.displayName,
            description: sanitizeCatalogDescription(item.description),
            icon: item.icon ?? undefined,
            mcpData: item.type === "mcp" ? (item.data as BasketItem["mcpData"]) : undefined,
            skillData: item.type === "skill" ? (item.data as BasketItem["skillData"]) : undefined,
            ruleData: item.type === "rule" ? (item.data as BasketItem["ruleData"]) : undefined,
            sourceMeta: {
              hint: deriveSourceHint(item),
            },
          },
          item,
        ),
      })),
      pagination: payload.pagination,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Catalog request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function CatalogGrid({
  initialCatalog,
  isSignedIn = false,
  enabledProviders = [],
  userRole,
  catalogUi,
  basketUi,
}: CatalogGridProps) {
  const defaultDiscovery = getCatalogDiscoveryDefaults();
  const [items, setItems] = useState<BasketItem[]>(initialCatalog?.items ?? []);
  const [loading, setLoading] = useState(!initialCatalog);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("mcps");
  const [trustFilter, setTrustFilter] = useState<CatalogTrustFilter>(defaultDiscovery.trust);
  const [sortOption, setSortOption] = useState<CatalogSort>(defaultDiscovery.sort);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<CatalogResponse["pagination"]>(
    initialCatalog?.pagination ?? {
      page: 1,
      limit: PAGE_SIZE,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  );
  const debouncedSearch = useDebounce(searchQuery, 300);
  const fetchIdRef = useRef(0);
  const shouldUseInitialCatalogRef = useRef(Boolean(initialCatalog));
  const discoveryState = useMemo(
    () => ({
      trust: trustFilter,
      freshness: defaultDiscovery.freshness,
      sort: sortOption,
    }),
    [defaultDiscovery.freshness, sortOption, trustFilter],
  );

  useEffect(() => {
    if (
      shouldUseInitialCatalogRef.current &&
      activeTab === "mcps" &&
      debouncedSearch === "" &&
      page === 1 &&
      isDefaultCatalogDiscoveryState(discoveryState)
    ) {
      shouldUseInitialCatalogRef.current = false;
      return;
    }

    const id = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    fetchCatalog(debouncedSearch, activeTab, page, discoveryState)
      .then((response) => {
        if (id !== fetchIdRef.current) return;
        setItems(response.items);
        setPagination(response.pagination);
        setLoading(false);
      })
      .catch((err) => {
        if (id !== fetchIdRef.current) return;
        console.error("[VibeBasket] fetch failed:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [activeTab, debouncedSearch, discoveryState, page]);

  const tabMap: Record<TabKey, { label: string; eyebrow: string; empty: string }> = catalogUi.tabs;
  const currentTab = tabMap[activeTab];
  const pageStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const pageEnd =
    pagination.total === 0 ? 0 : Math.min(pagination.total, pagination.page * pagination.limit);
  const hasActiveDiscoveryFilters = !isDefaultCatalogDiscoveryState(discoveryState);
  const trustOptions = TRUST_FILTER_OPTIONS.map((option) => ({
    ...option,
    label:
      catalogUi.filters.trustOptions[option.value as keyof typeof catalogUi.filters.trustOptions],
  }));
  const sortOptions = SORT_OPTIONS.map((option) => ({
    ...option,
    label:
      catalogUi.filters.sortOptions[option.value as keyof typeof catalogUi.filters.sortOptions],
  }));
  const activeFilterSummaries = [
    trustFilter !== defaultDiscovery.trust
      ? trustOptions.find((option) => option.value === trustFilter)?.label
      : null,
    sortOption !== defaultDiscovery.sort
      ? sortOptions.find((option) => option.value === sortOption)?.label
      : null,
  ].filter(Boolean) as string[];

  return (
    <div className="border-t border-border/80">
      <div className="mx-auto max-w-[1440px] px-4 py-16 pb-36 sm:px-6 sm:pb-40 lg:px-8 lg:py-20 lg:pb-20">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            {catalogUi.builderEyebrow}
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {catalogUi.builderTitle}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            {catalogUi.builderDescription}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {[
            catalogUi.chips.trustedSources,
            catalogUi.chips.trustAwareDiscovery,
            formatTemplate(catalogUi.chips.itemsPerPage, { count: PAGE_SIZE }),
          ].map((chip) => (
            <span
              key={chip}
              className="inline-flex border border-border/70 bg-background/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:pr-4 custom-scrollbar">
            <div className="border border-border/80 bg-card/60">
              <div className="border-b border-border/70 px-4 py-4">
                <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                  {(Object.keys(tabMap) as TabKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setActiveTab(key);
                        setPage(1);
                      }}
                      className={cn(
                        "w-full border px-3 py-2 text-left font-mono text-[11px] uppercase tracking-[0.18em] transition-colors sm:w-auto sm:text-center",
                        activeTab === key
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-transparent text-muted-foreground hover:border-border/70 hover:text-foreground",
                      )}
                    >
                      {tabMap[key].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-b border-border/70 px-4 py-4 sm:px-5">
                <div className="grid gap-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {currentTab.eyebrow}
                    </p>
                    <div className="relative mt-3">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        aria-label={formatTemplate(catalogUi.searchPlaceholder, {
                          label: currentTab.label.toLowerCase(),
                        })}
                        placeholder={formatTemplate(catalogUi.searchPlaceholder, {
                          label: currentTab.label.toLowerCase(),
                        })}
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setPage(1);
                        }}
                        className="h-12 w-full border border-border/70 bg-background/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="grid gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setShowFilters((current) => !current)}
                          aria-expanded={showFilters}
                          className={cn(
                            "inline-flex h-10 w-full items-center justify-between gap-2 border px-3 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors sm:w-auto sm:justify-start",
                            showFilters || hasActiveDiscoveryFilters
                              ? "border-accent/60 bg-accent/10 text-accent"
                              : "border-border/70 bg-background/30 text-muted-foreground hover:border-accent/40 hover:text-foreground",
                          )}
                        >
                          <SlidersHorizontal className="h-4 w-4" />
                          {catalogUi.filters.toggle}
                          {activeFilterSummaries.length > 0 ? (
                            <span className="inline-flex min-w-5 items-center justify-center border border-accent/40 px-1.5 py-0.5 text-[10px] text-accent">
                              {activeFilterSummaries.length}
                            </span>
                          ) : null}
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              showFilters && "rotate-180",
                            )}
                          />
                        </button>

                        {activeFilterSummaries.length > 0 ? (
                          <>
                            <div className="flex flex-wrap gap-2">
                              {activeFilterSummaries.map((summary) => (
                                <span
                                  key={summary}
                                  className="inline-flex border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent"
                                >
                                  {summary}
                                </span>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setTrustFilter(defaultDiscovery.trust);
                                setSortOption(defaultDiscovery.sort);
                              }}
                              className="inline-flex h-9 items-center gap-2 border border-border/70 px-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
                            >
                              <X className="h-3.5 w-3.5" />
                              {catalogUi.filters.clear}
                            </button>
                          </>
                        ) : null}
                      </div>

                      {showFilters ? (
                        <div className="grid gap-3 border border-border/70 bg-background/20 p-3 md:grid-cols-2">
                          {[
                            {
                              label: catalogUi.filters.trust,
                              value: trustFilter,
                              onChange: setTrustFilter,
                              options: trustOptions,
                            },
                            {
                              label: catalogUi.filters.sort,
                              value: sortOption,
                              onChange: setSortOption,
                              options: sortOptions,
                            },
                          ].map((group) => (
                            <div key={group.label}>
                              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                {group.label}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {group.options.map((option) => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => group.onChange(option.value as never)}
                                    className={cn(
                                      "border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
                                      group.value === option.value
                                        ? "border-accent bg-accent/10 text-accent"
                                        : "border-border/70 bg-background/30 text-muted-foreground hover:border-accent/40 hover:text-foreground",
                                    )}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="grid gap-1 text-sm text-muted-foreground xl:text-right">
                      <span>
                        {formatTemplate(catalogUi.summary.showing, {
                          start: pageStart,
                          end: pageEnd,
                          total: pagination.total,
                        })}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
                        {pagination.totalPages > 0
                          ? formatTemplate(catalogUi.summary.pageOf, {
                              page: pagination.page,
                              totalPages: pagination.totalPages,
                            })
                          : formatTemplate(catalogUi.summary.page, {
                              page: pagination.page,
                            })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {loading ? (
                  <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 border border-dashed border-border/70 bg-background/20">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {catalogUi.states.loading}
                    </p>
                  </div>
                ) : error ? (
                  <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 border border-dashed border-border/70 bg-background/20 px-6 text-center">
                    <p className="text-sm text-destructive">Error: {error}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setLoading(true);
                        fetchIdRef.current++;
                        fetchCatalog(debouncedSearch, activeTab, page, discoveryState)
                          .then((response) => {
                            setItems(response.items);
                            setPagination(response.pagination);
                            setLoading(false);
                          })
                          .catch((retryError) => {
                            setError(
                              retryError instanceof Error
                                ? retryError.message
                                : catalogUi.states.retryFailed,
                            );
                            setLoading(false);
                          });
                      }}
                      className="border border-border/70 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-accent/50 hover:text-accent"
                    >
                      {catalogUi.states.retry}
                    </button>
                  </div>
                ) : items.length > 0 ? (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <ItemCard key={item.id} item={item} copy={catalogUi} />
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 border border-dashed border-border/70 bg-background/20 px-6 text-center">
                    <p className="text-base font-medium text-foreground">{currentTab.empty}</p>
                    <p className="max-w-md text-sm text-muted-foreground">
                      {catalogUi.states.emptyHint}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-border/70 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    {catalogUi.states.performanceHint}
                  </p>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={!pagination.hasPreviousPage}
                      className="inline-flex h-10 w-full items-center justify-center gap-2 border border-border/70 px-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {catalogUi.pagination.previous}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((current) => current + 1)}
                      disabled={!pagination.hasNextPage}
                      className="inline-flex h-10 w-full items-center justify-center gap-2 border border-border/70 px-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                    >
                      {catalogUi.pagination.next}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <BasketPanel
            className="hidden lg:block"
            isSignedIn={isSignedIn}
            enabledProviders={enabledProviders}
            userRole={userRole}
            copy={basketUi}
          />
        </div>
      </div>
    </div>
  );
}
