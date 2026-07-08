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
    title: `${dictionary.shared.status.forbiddenTitle} | VibeBasket`,
    description: dictionary.shared.status.forbiddenSummary,
    robots: metadata.robots,
  };
}

export default async function ForbiddenPage() {
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("x-locale"));
  const dictionary = await getDictionary(locale);

  return (
    <StatusPage
      locale={locale}
      eyebrow={dictionary.shared.status.forbiddenEyebrow}
      title={dictionary.shared.status.forbiddenTitle}
      summary={dictionary.shared.status.forbiddenSummary}
      primaryAction={{ href: `/${locale}`, label: dictionary.shared.navigation.backToCatalog }}
      secondaryAction={{
        href: `/${locale}/login?callbackUrl=${encodeURIComponent(`/${locale}/admin`)}`,
        label: dictionary.shared.status.openLogin,
      }}
      tone="warning"
      homeLabel={dictionary.shared.navigation.home}
      nextStepLabel={dictionary.shared.status.nextStep}
      nextStepBody={dictionary.shared.status.nextStepBody}
    />
  );
}
