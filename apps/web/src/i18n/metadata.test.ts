import { describe, expect, it } from "vitest";
import { buildLocaleAlternates, buildLocaleMetadata } from "./metadata";

describe("i18n metadata", () => {
  it("builds language alternates", () => {
    expect(buildLocaleAlternates("/docs")).toEqual({
      en: "/en/docs",
      tr: "/tr/docs",
      es: "/es/docs",
      zh: "/zh/docs",
      hi: "/hi/docs",
    });
  });

  it("builds localized metadata with x-default", () => {
    const metadata = buildLocaleMetadata({
      locale: "tr",
      pathname: "/docs",
      title: "Docs",
      description: "Desc",
    });

    expect(metadata.alternates?.canonical).toBe("/tr/docs");
    expect(metadata.alternates?.languages).toMatchObject({
      en: "/en/docs",
      tr: "/tr/docs",
      es: "/es/docs",
      zh: "/zh/docs",
      hi: "/hi/docs",
      "x-default": "/en/docs",
    });
    expect(metadata.openGraph?.locale).toBe("tr_TR");
  });
});
