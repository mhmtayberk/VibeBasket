export function buildCatalogCountCacheKey(input: {
  type: string | null;
  trust: string;
  freshness: string;
  search: string;
}) {
  return `${input.type ?? ""}|${input.trust}|${input.freshness}|${input.search.toLowerCase()}`;
}
