export const SUPPORTED_LOCALES = ["en", "tr", "es", "zh", "hi"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";

const SUPPORTED_LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

export function isSupportedLocale(value: string | null | undefined): value is AppLocale {
  return Boolean(value && SUPPORTED_LOCALE_SET.has(value));
}

export function resolveLocale(value: string | null | undefined): AppLocale {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}
