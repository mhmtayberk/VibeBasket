import type { Metadata } from "next";
import type { AppLocale } from "./config";
import { SUPPORTED_LOCALES } from "./config";
import { localizePath } from "./locale-routing";

const OPEN_GRAPH_LOCALE_MAP: Record<AppLocale, string> = {
  en: "en_US",
  tr: "tr_TR",
  es: "es_ES",
  zh: "zh_CN",
  hi: "hi_IN",
};

export function buildLocaleAlternates(basePath: string) {
  return Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [locale, localizePath(locale, basePath)]),
  ) as Record<AppLocale, string>;
}

export function buildLocaleMetadata(input: {
  locale: AppLocale;
  pathname: string;
  title: string;
  description: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
  noIndex?: boolean;
}): Metadata {
  const canonical = localizePath(input.locale, input.pathname);

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical,
      languages: {
        ...buildLocaleAlternates(input.pathname),
        "x-default": localizePath("en", input.pathname),
      },
    },
    openGraph: {
      title: input.openGraphTitle ?? input.title,
      description: input.openGraphDescription ?? input.description,
      url: canonical,
      locale: OPEN_GRAPH_LOCALE_MAP[input.locale],
    },
    twitter: {
      title: input.openGraphTitle ?? input.title,
      description: input.openGraphDescription ?? input.description,
    },
    robots: input.noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}
