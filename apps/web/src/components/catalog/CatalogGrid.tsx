"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import type { EnabledAuthProvider } from "@/auth.config";
import type { BasketItem } from "@/store/basketStore";
import { BasketPanel } from "@/components/basket/BasketPanel";
import { ItemCard } from "./ItemCard";
import { cn } from "@/lib/utils";
import { withCatalogTrust } from "@/lib/catalog-trust";
import {
  SORT_OPTIONS,
  TRUST_FILTER_OPTIONS,
  getCatalogDiscoveryDefaults,
  isDefaultCatalogDiscoveryState,
  type CatalogSort,
  type CatalogTrustFilter,
} from "@/lib/catalog-discovery";

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
}

function deriveSourceHint(item: any) {
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
  }
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

    return {
      items: (payload.items as any[]).map((item) => ({
        ...withCatalogTrust({
          id: item.id,
          type: item.type,
          name: item.displayName,
          description: item.description ?? "",
          icon: item.icon,
          mcpData: item.data,
          sourceMeta: {
            hint: deriveSourceHint(item),
          },
        }, item),
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
  const [pagination, setPagination] = useState<CatalogResponse["pagination"]>(initialCatalog?.pagination ?? {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const debouncedSearch = useDebounce(searchQuery, 300);
  const fetchIdRef = useRef(0);
  const shouldUseInitialCatalogRef = useRef(Boolean(initialCatalog));
  const discoveryState = {
    trust: trustFilter,
    freshness: defaultDiscovery.freshness,
    sort: sortOption,
  };

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
  }, [activeTab, debouncedSearch, page, trustFilter, sortOption]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedSearch, trustFilter, sortOption]);

  const tabMap: Record<TabKey, { label: string; eyebrow: string; empty: string }> = {
    mcps: {
      label: "MCP Servers",
      eyebrow: "Trusted runtime connectors",
      empty: "No MCP servers match this search yet.",
    },
    skills: {
      label: "Skills",
      eyebrow: "Reusable agent capabilities",
      empty: "No skills match this search yet.",
    },
    rules: {
      label: "Rules",
      eyebrow: "Portable working conventions",
      empty: "No rules match this search yet.",
    },
  };

  const currentTab = tabMap[activeTab];
  const pageStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const pageEnd = pagination.total === 0 ? 0 : Math.min(pagination.total, pagination.page * pagination.limit);
  const hasActiveDiscoveryFilters = !isDefaultCatalogDiscoveryState(discoveryState);
  const activeFilterSummaries = [
    trustFilter !== defaultDiscovery.trust
      ? TRUST_FILTER_OPTIONS.find((option) => option.value === trustFilter)?.label
      : null,
    sortOption !== defaultDiscovery.sort
      ? SORT_OPTIONS.find((option) => option.value === sortOption)?.label
      : null,
  ].filter(Boolean) as string[];

  return (
    <div className="border-t border-border/80">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            The Builder
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Build your stack without reconfiguring everything by hand.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Browse trusted components, assemble your basket, and generate a single install command
            for the editors your team actually uses.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {["Trusted sources", "Trust-aware discovery", `${PAGE_SIZE} items per page`].map((chip) => (
            <span
              key={chip}
              className="inline-flex border border-border/70 bg-background/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-5">
            <div className="border border-border/80 bg-card/60">
              <div className="border-b border-border/70 px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(tabMap) as TabKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setActiveTab(key);
                        setPage(1);
                      }}
                      className={cn(
                        "border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
                        activeTab === key
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-transparent text-muted-foreground hover:border-border/70 hover:text-foreground"
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
                        aria-label={`Search ${currentTab.label.toLowerCase()}`}
                        placeholder={`Search ${currentTab.label.toLowerCase()}...`}
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setPage(1);
                        }}
                        className="h-12 w-full border border-border/70 bg-background/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                    <div className="grid gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setShowFilters((current) => !current)}
                          aria-expanded={showFilters}
                          className={cn(
                            "inline-flex h-10 items-center gap-2 border px-3 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
                            showFilters || hasActiveDiscoveryFilters
                              ? "border-accent/60 bg-accent/10 text-accent"
                              : "border-border/70 bg-background/30 text-muted-foreground hover:border-accent/40 hover:text-foreground"
                          )}
                        >
                          <SlidersHorizontal className="h-4 w-4" />
                          Filters
                          {activeFilterSummaries.length > 0 ? (
                            <span className="inline-flex min-w-5 items-center justify-center border border-accent/40 px-1.5 py-0.5 text-[10px] text-accent">
                              {activeFilterSummaries.length}
                            </span>
                          ) : null}
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              showFilters && "rotate-180"
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
                              Clear
                            </button>
                          </>
                        ) : null}
                      </div>

                      {showFilters ? (
                        <div className="grid gap-3 border border-border/70 bg-background/20 p-3 md:grid-cols-3">
                          {[
                            {
                              label: "Trust",
                              value: trustFilter,
                              onChange: setTrustFilter,
                              options: TRUST_FILTER_OPTIONS,
                            },
                            {
                              label: "Sort",
                              value: sortOption,
                              onChange: setSortOption,
                              options: SORT_OPTIONS,
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
                                        : "border-border/70 bg-background/30 text-muted-foreground hover:border-accent/40 hover:text-foreground"
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
                        Showing <span className="font-medium text-foreground">{pageStart}-{pageEnd}</span> of{" "}
                        <span className="font-medium text-foreground">{pagination.total}</span>
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
                        Page {pagination.page}{pagination.totalPages > 0 ? ` / ${pagination.totalPages}` : ""}
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
                      Loading catalog
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
                            setError(retryError instanceof Error ? retryError.message : "Retry failed");
                            setLoading(false);
                          });
                      }}
                      className="border border-border/70 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-accent/50 hover:text-accent"
                    >
                      Retry request
                    </button>
                  </div>
                ) : items.length > 0 ? (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 border border-dashed border-border/70 bg-background/20 px-6 text-center">
                    <p className="text-base font-medium text-foreground">{currentTab.empty}</p>
                    <p className="max-w-md text-sm text-muted-foreground">
                      Try a broader search term or switch to another catalog category.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-border/70 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Large catalogs stay fast by loading only the current page and active category.
                  </p>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={!pagination.hasPreviousPage}
                      className="inline-flex h-10 items-center gap-2 border border-border/70 px-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((current) => current + 1)}
                      disabled={!pagination.hasNextPage}
                      className="inline-flex h-10 items-center gap-2 border border-border/70 px-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
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
          />
        </div>
      </div>
    </div>
  );
}
