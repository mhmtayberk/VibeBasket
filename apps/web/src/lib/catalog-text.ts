const UNREADABLE_DESCRIPTION_PATTERN = /�|ï¿/u;

export function sanitizeCatalogDescription(value?: string | null) {
  const text = value?.trim();
  if (!text) {
    return "";
  }

  return UNREADABLE_DESCRIPTION_PATTERN.test(text) ? "" : text;
}
