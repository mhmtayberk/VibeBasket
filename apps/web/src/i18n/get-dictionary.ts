import { type AppLocale, DEFAULT_LOCALE } from "./config";
import type { AppDictionary } from "./dictionaries/en";

const dictionaryLoaders: Record<AppLocale, () => Promise<AppDictionary>> = {
  en: async () => (await import("./dictionaries/en")).enDictionary,
  tr: async () => (await import("./dictionaries/tr")).trDictionary,
  es: async () => (await import("./dictionaries/es")).esDictionary,
  zh: async () => (await import("./dictionaries/zh")).zhDictionary,
  hi: async () => (await import("./dictionaries/hi")).hiDictionary,
  ru: async () => (await import("./dictionaries/ru")).ruDictionary,
};

export async function getDictionary(locale: AppLocale): Promise<AppDictionary> {
  const loader = dictionaryLoaders[locale] ?? dictionaryLoaders[DEFAULT_LOCALE];
  return loader();
}
