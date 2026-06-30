import type { Metadata } from "next";
import { StatusPage } from "../components/layout/StatusPage";

export const metadata: Metadata = {
  title: "Page Not Found | VibeBasket",
  description: "The requested VibeBasket page could not be found.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFoundPage() {
  return (
    <StatusPage
      eyebrow="404 · Missing route"
      title="Page not found"
      summary="That route is not available anymore, never existed, or was typed with the wrong path. Head back to the catalog or reopen the docs."
      primaryAction={{ href: "/", label: "Return home" }}
      secondaryAction={{ href: "/docs", label: "Open docs" }}
    />
  );
}
