import type { Metadata } from "next";
import { StatusPage } from "../components/layout/StatusPage";

export const metadata: Metadata = {
  title: "Access Restricted | VibeBasket",
  description: "You do not have permission to access this VibeBasket page.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForbiddenPage() {
  return (
    <StatusPage
      eyebrow="403 · Access restricted"
      title="You do not have access to this page"
      summary="This area is reserved for an authorized account in the current environment. Return to the main catalog or sign in with an approved administrator profile."
      primaryAction={{ href: "/", label: "Back to catalog" }}
      secondaryAction={{ href: "/login?callbackUrl=%2Fadmin", label: "Open login" }}
      tone="warning"
    />
  );
}
