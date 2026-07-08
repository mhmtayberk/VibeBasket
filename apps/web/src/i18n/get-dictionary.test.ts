import { describe, expect, it } from "vitest";
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
});
