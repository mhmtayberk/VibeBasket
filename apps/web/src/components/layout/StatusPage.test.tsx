import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StatusPage } from "./StatusPage";

describe("StatusPage", () => {
  it("renders the supplied title, summary, and actions", () => {
    const html = renderToStaticMarkup(
      <StatusPage
        eyebrow="Test"
        title="Page not found"
        summary="The requested page does not exist."
        primaryAction={{ href: "/", label: "Return home" }}
        secondaryAction={{ href: "/docs", label: "Open docs" }}
      />,
    );

    expect(html).toContain("Page not found");
    expect(html).toContain("The requested page does not exist.");
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/docs"');
  });
});
