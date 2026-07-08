import { auth, getEnabledAuthProviders } from "@/auth";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { SavedStacksPanel } from "@/components/stacks/SavedStacksPanel";
import { type AppLocale, isSupportedLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizePath } from "@/i18n/locale-routing";
import { buildLocaleMetadata } from "@/i18n/metadata";
import { ArrowLeft, Layers3, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
    pathname: "/stacks",
    title: `${dictionary.shared.auth.yourSavedStacks} | VibeBasket`,
    description: dictionary.shared.auth.yourSavedStacksBody,
    noIndex: true,
  });
}

export default async function LocalizedStacksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, session] = await Promise.all([params, auth()]);

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const enabledProviders = getEnabledAuthProviders();

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col gap-6 border border-border/80 bg-card/80 p-8">
          <div className="inline-flex w-fit items-center gap-2 border border-border/70 bg-background/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
            <ShieldCheck className="h-3.5 w-3.5" />
            {dictionary.shared.auth.authenticationRequired}
          </div>
          <h1 className="text-3xl font-semibold">
            {dictionary.shared.auth.signInToAccessSavedStacks}
          </h1>
          <p className="text-sm leading-7 text-muted-foreground">
            {dictionary.shared.auth.signInToAccessSavedStacksBody}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <SignInDialog
              providers={enabledProviders}
              callbackUrl={localizePath(locale, "/stacks")}
              locale={locale}
            />
            <a
              href={localizePath(locale, "/")}
              className="inline-flex items-center gap-2 border border-border/80 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {dictionary.shared.navigation.backToCatalog}
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <a
          href={localizePath(locale, "/")}
          className="inline-flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {dictionary.shared.navigation.backToBuilder}
        </a>

        <section className="border border-border/80 bg-card/80 p-8">
          <div className="inline-flex w-fit items-center gap-2 border border-border/70 bg-background/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
            <Layers3 className="h-3.5 w-3.5" />
            {dictionary.shared.auth.savedStacks}
          </div>
          <h1 className="mt-5 text-3xl font-semibold">{dictionary.shared.auth.yourSavedStacks}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            {dictionary.shared.auth.yourSavedStacksBody}
          </p>

          <SavedStacksPanel className="mt-8" enabled={true} />
        </section>
      </div>
    </main>
  );
}
