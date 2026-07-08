import { resolveLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { StatusPage } from "../components/layout/StatusPage";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("x-locale"));
  const dictionary = await getDictionary(locale);

  return {
    title: `${dictionary.shared.status.notFoundTitle} | VibeBasket`,
    description: dictionary.shared.status.notFoundSummary,
    robots: metadata.robots,
  };
}

export default async function NotFoundPage() {
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("x-locale"));
  const dictionary = await getDictionary(locale);

  return (
    <StatusPage
      locale={locale}
      eyebrow={dictionary.shared.status.notFoundEyebrow}
      title={dictionary.shared.status.notFoundTitle}
      summary={dictionary.shared.status.notFoundSummary}
      primaryAction={{ href: `/${locale}`, label: dictionary.shared.navigation.returnHome }}
      secondaryAction={{ href: `/${locale}/docs`, label: dictionary.shared.navigation.openDocs }}
      homeLabel={dictionary.shared.navigation.home}
      nextStepLabel={dictionary.shared.status.nextStep}
      nextStepBody={dictionary.shared.status.nextStepBody}
    />
  );
}
