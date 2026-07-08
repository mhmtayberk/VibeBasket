import { getEnabledAuthProviders } from "@/auth";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { type AppLocale, isSupportedLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizePath, shouldRedirectToDefaultLocale } from "@/i18n/locale-routing";
import { buildLocaleMetadata } from "@/i18n/metadata";
import { getOptionalSession } from "@/lib/auth-safe";
import { sanitizeCallbackUrl } from "@/lib/safe-redirect";
import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const dictionary = await getDictionary(locale);

  return buildLocaleMetadata({
    locale,
    pathname: "/login",
    title: `${dictionary.shared.auth.signInToSaveStacks} | VibeBasket`,
    description: dictionary.shared.auth.signInToSaveStacks,
    noIndex: true,
  });
}

export default async function LocalizedLoginPage({ params, searchParams }: LoginPageProps) {
  const [{ locale }, session, resolvedSearchParams] = await Promise.all([
    params,
    getOptionalSession("localized-login-page"),
    searchParams,
  ]);

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const callbackUrl = sanitizeCallbackUrl(resolvedSearchParams?.callbackUrl);
  const [callbackPathname, callbackSearch = ""] = callbackUrl.split("?");
  const backHref = shouldRedirectToDefaultLocale(callbackPathname)
    ? `${localizePath(locale, callbackPathname)}${callbackSearch ? `?${callbackSearch}` : ""}`
    : callbackUrl;

  if (session?.user) {
    redirect(callbackUrl);
  }

  const providers = getEnabledAuthProviders();

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={localizePath(locale, "/")}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            VibeBasket
          </Link>
          <Link
            href={backHref}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
          >
            {dictionary.shared.navigation.back}
          </Link>
        </div>

        <section className="grid gap-8 border border-border/80 bg-card/70 p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
          <div className="space-y-6">
            <div className="inline-flex w-fit items-center gap-2 border border-border/70 bg-background/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
              <ShieldCheck className="h-3.5 w-3.5" />
              {dictionary.shared.auth.accountSync}
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {dictionary.shared.auth.signInToSaveStacks}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                {dictionary.shared.auth.savedBasketsLead}
              </p>
            </div>

            <div className="grid gap-3 border border-border/60 bg-background/30 p-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {dictionary.shared.auth.profileSync}
                </p>
                <p className="text-sm text-foreground">{dictionary.shared.auth.profileSyncBody}</p>
              </div>
              <div className="space-y-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {dictionary.shared.auth.providerChoice}
                </p>
                <p className="text-sm text-foreground">
                  {dictionary.shared.auth.providerChoiceBody}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {dictionary.shared.auth.safeReturn}
                </p>
                <p className="text-sm text-foreground">{dictionary.shared.auth.safeReturnBody}</p>
              </div>
            </div>
          </div>

          <div className="border border-border/70 bg-background/40 p-5">
            {providers.length > 0 ? (
              <AuthButtons
                providers={providers}
                callbackUrl={callbackUrl}
                continueWithLabel={dictionary.shared.auth.continueWith}
              />
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  {dictionary.shared.auth.loginNotConfigured}
                </p>
                <p className="text-xs leading-6 text-muted-foreground">
                  {dictionary.shared.auth.loginNotConfiguredBody}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
