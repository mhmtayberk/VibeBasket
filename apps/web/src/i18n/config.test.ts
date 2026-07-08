import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, isSupportedLocale, resolveLocale } from "./config";
import {
  buildDefaultLocaleRedirectPath,
  getLocaleFromPathname,
  localizePath,
  shouldRedirectToDefaultLocale,
  stripLocaleFromPathname,
} from "./locale-routing";

describe("i18n config", () => {
  it("keeps the expected supported locales", () => {
    expect(SUPPORTED_LOCALES).toEqual(["en", "tr", "es", "zh", "hi"]);
    expect(DEFAULT_LOCALE).toBe("en");
  });

  it("validates locales strictly", () => {
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("zh")).toBe(true);
    expect(isSupportedLocale("hi")).toBe(true);
    expect(isSupportedLocale("de")).toBe(false);
    expect(resolveLocale("tr")).toBe("tr");
    expect(resolveLocale("zh")).toBe("zh");
    expect(resolveLocale("de")).toBe("en");
  });
});

describe("locale routing", () => {
  it("detects locale segments", () => {
    expect(getLocaleFromPathname("/tr/docs")).toBe("tr");
    expect(getLocaleFromPathname("/docs")).toBeNull();
  });

  it("strips locale segments", () => {
    expect(stripLocaleFromPathname("/es/docs")).toBe("/docs");
    expect(stripLocaleFromPathname("/en")).toBe("/");
  });

  it("localizes public paths", () => {
    expect(localizePath("tr", "/docs")).toBe("/tr/docs");
    expect(localizePath("es", "/")).toBe("/es");
  });

  it("knows which public routes should redirect to default locale", () => {
    expect(shouldRedirectToDefaultLocale("/")).toBe(true);
    expect(shouldRedirectToDefaultLocale("/docs")).toBe(true);
    expect(shouldRedirectToDefaultLocale("/en/docs")).toBe(false);
    expect(shouldRedirectToDefaultLocale("/api/catalog/status")).toBe(false);
  });

  it("builds default locale redirect paths", () => {
    expect(buildDefaultLocaleRedirectPath("/docs", "?tab=cli")).toBe("/en/docs?tab=cli");
  });
});
