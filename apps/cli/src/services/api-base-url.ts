export function getApiBaseUrl(): string {
  return process.env.VIBEBASKET_API_URL || "https://vibebasket.dev";
}

export function getCatalogRefreshToken(): string | null {
  const token = process.env.VIBEBASKET_CATALOG_REFRESH_TOKEN?.trim();
  return token ? token : null;
}
