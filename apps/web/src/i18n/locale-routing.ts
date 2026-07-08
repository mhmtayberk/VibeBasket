import { type AppLocale, DEFAULT_LOCALE, isSupportedLocale } from "./config";

const UNLOCALIZED_PUBLIC_PATHS = new Set(["/", "/docs", "/login", "/stacks", "/admin"]);

function normalizePathname(pathname: string) {
  if (!pathname) {
    return "/";
  }

  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return normalized === "/" ? normalized : normalized.replace(/\/+$/, "");
}

export function getLocaleFromPathname(pathname: string): AppLocale | null {
  const normalized = normalizePathname(pathname);
  const [, firstSegment] = normalized.split("/");

  return isSupportedLocale(firstSegment) ? firstSegment : null;
}

export function stripLocaleFromPathname(pathname: string): string {
  const normalized = normalizePathname(pathname);
  const locale = getLocaleFromPathname(normalized);

  if (!locale) {
    return normalized;
  }

  const nextPath = normalized.slice(`/${locale}`.length);
  return nextPath.length === 0 ? "/" : nextPath;
}

export function localizePath(locale: AppLocale, pathname: string) {
  const basePath = stripLocaleFromPathname(pathname);

  if (basePath === "/") {
    return `/${locale}`;
  }

  return `/${locale}${basePath}`;
}

export function isExplicitlyLocalizedPath(pathname: string) {
  return getLocaleFromPathname(pathname) !== null;
}

export function shouldRedirectToDefaultLocale(pathname: string) {
  if (isExplicitlyLocalizedPath(pathname)) {
    return false;
  }

  const normalized = normalizePathname(pathname);

  if (UNLOCALIZED_PUBLIC_PATHS.has(normalized)) {
    return true;
  }

  for (const route of UNLOCALIZED_PUBLIC_PATHS) {
    if (route !== "/" && normalized.startsWith(`${route}/`)) {
      return true;
    }
  }

  return false;
}

export function buildDefaultLocaleRedirectPath(pathname: string, search: string) {
  const target = localizePath(DEFAULT_LOCALE, pathname);
  return search ? `${target}${search}` : target;
}

export function localizeRelativeUrl(locale: AppLocale, pathname: string, search?: string) {
  const localizedPath = localizePath(locale, pathname);
  return search ? `${localizedPath}${search}` : localizedPath;
}
