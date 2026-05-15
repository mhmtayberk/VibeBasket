"use client";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { ItemCard } from "./ItemCard";
import type { BasketItem } from "@/store/basketStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

type TabKey = "mcps" | "skills" | "rules";
const REQUEST_TIMEOUT_MS = 8000;
const PAGE_SIZE = 24;
const TAB_TO_TYPE: Record<TabKey, "mcp" | "skill" | "rule"> = {
  mcps: "mcp",
  skills: "skill",
  rules: "rule",
};

interface CatalogResponse {
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

async function fetchCatalog(query: string, activeTab: TabKey, page: number): Promise<CatalogResponse> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const params = new URLSearchParams({
    page: `${page}`,
    limit: `${PAGE_SIZE}`,
    q: query,
    type: TAB_TO_TYPE[activeTab],
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
        id: item.id,
        type: item.type,
        name: item.displayName,
        description: item.description ?? "",
        icon: item.icon,
        mcpData: item.data,
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

export function CatalogGrid() {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("mcps");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<CatalogResponse["pagination"]>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const debouncedSearch = useDebounce(searchQuery, 300);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const id = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    fetchCatalog(debouncedSearch, activeTab, page)
      .then((response) => {
        // Only apply if this is still the latest request
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
  }, [activeTab, debouncedSearch, page]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedSearch]);

  const tabMap: Record<TabKey, { label: string; items: BasketItem[]; empty: string }> = {
    mcps: { label: "MCP Servers", items, empty: "No MCP servers found." },
    skills: { label: "Skills", items, empty: "No Skills found." },
    rules: { label: "Rules", items, empty: "No Rules found." },
  };

  const currentTab = tabMap[activeTab];
  const pageStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const pageEnd = pagination.total === 0
    ? 0
    : Math.min(pagination.total, pagination.page * pagination.limit);

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-8">
      {/* Search */}
      <div className="relative max-w-md mx-auto mb-10">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          type="text"
          placeholder="Search MCPs, Skills, Rules..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="w-full pl-11 h-12 rounded-2xl bg-secondary/20 border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all text-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-secondary/20 border border-border/50 p-1.5 rounded-2xl w-full sm:w-auto">
          {(Object.keys(tabMap) as TabKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActiveTab(key);
                setPage(1);
              }}
              className={`flex-1 sm:flex-initial rounded-xl px-4 sm:px-6 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === key
                  ? "bg-primary text-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tabMap[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {!loading && !error ? (
          <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-border/40 bg-secondary/10 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div>
              Showing <span className="font-medium text-foreground">{pageStart}-{pageEnd}</span> of{" "}
              <span className="font-medium text-foreground">{pagination.total}</span> {currentTab.label.toLowerCase()}
            </div>
            <div>
              Page <span className="font-medium text-foreground">{pagination.page}</span>
              {pagination.totalPages > 0 ? ` / ${pagination.totalPages}` : ""}
            </div>
          </div>
        ) : null}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <svg className="w-8 h-8 text-accent animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="15" strokeLinecap="round"/>
            </svg>
            <p className="text-xs text-muted-foreground">Loading catalog...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive text-sm">Error: {error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchIdRef.current++;
                fetchCatalog(debouncedSearch, activeTab, page)
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
              className="mt-4 text-accent underline text-sm"
            >
              Retry
            </button>
          </div>
        ) : currentTab.items.length > 0 ? (
          <>
            <div className="flex flex-col gap-3">
              {currentTab.items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border/40 bg-secondary/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Large catalogs stay fast by loading {pagination.limit} items at a time.
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={!pagination.hasPreviousPage}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/50 px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={!pagination.hasNextPage}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/50 px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
            <p className="text-muted-foreground text-sm">{currentTab.empty}</p>
          </div>
        )}
      </div>
    </div>
  );
}
