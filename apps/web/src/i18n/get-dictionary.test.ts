import { describe, expect, it } from "vitest";
import { SUPPORTED_TARGET_COUNT } from "../lib/targets";
import { SUPPORTED_LOCALES } from "./config";
import { getDictionary } from "./get-dictionary";

describe("getDictionary", () => {
  it("loads english copy", async () => {
    const dictionary = await getDictionary("en");

    expect(dictionary.home.hero.github).toBe("GitHub");
  });

  it("loads turkish copy", async () => {
    const dictionary = await getDictionary("tr");

    expect(dictionary.shared.navigation.documentation).toBe("Dokümantasyon");
  });

  it("loads spanish copy", async () => {
    const dictionary = await getDictionary("es");

    expect(dictionary.shared.localeSwitcher.label).toBe("Idioma");
  });

  it("loads simplified chinese copy", async () => {
    const dictionary = await getDictionary("zh");

    expect(dictionary.shared.localeSwitcher.label).toBe("语言");
  });

  it("loads hindi copy", async () => {
    const dictionary = await getDictionary("hi");

    expect(dictionary.shared.localeSwitcher.label).toBe("भाषा");
  });

  it("loads russian copy", async () => {
    const dictionary = await getDictionary("ru");

    expect(dictionary.shared.localeSwitcher.label).toBe("Язык");
  });

  it("keeps target counts current in every locale", async () => {
    for (const locale of SUPPORTED_LOCALES) {
      const dictionary = await getDictionary(locale);
      expect(dictionary.home.hero.badge).toContain(String(SUPPORTED_TARGET_COUNT));
      expect(dictionary.docs.metadataAdapters.title).toContain(String(SUPPORTED_TARGET_COUNT));
      expect(dictionary.docs.metadataAdapters.description).toMatch(
        new RegExp(`${SUPPORTED_TARGET_COUNT}|${SUPPORTED_TARGET_COUNT - 5}`),
      );
    }
  });
});
