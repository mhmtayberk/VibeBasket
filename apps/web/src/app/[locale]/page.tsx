import { getEnabledAuthProviders } from "@/auth";
import { AuthMenu } from "@/components/auth/AuthMenu";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { FloatingBasket } from "@/components/basket/FloatingBasket";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { TopToTopButton } from "@/components/layout/TopToTopButton";
import { TypingTerminal } from "@/components/marketing/TypingTerminal";
import { type AppLocale, isSupportedLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizePath } from "@/i18n/locale-routing";
import { buildLocaleMetadata } from "@/i18n/metadata";
import { getOptionalSession } from "@/lib/auth-safe";
import { getInitialCatalogSnapshot } from "@/lib/catalog-snapshot";
import { SUPPORTED_TARGET_COUNT, TARGET_OPTIONS } from "@/lib/targets";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Lock,
  Package2,
  Sparkles,
  TerminalSquare,
  Workflow,
} from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
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
    pathname: "/",
    title: dictionary.home.metadata.title,
    description: dictionary.home.metadata.description,
    openGraphTitle: dictionary.home.metadata.title,
    openGraphDescription: dictionary.home.metadata.ogDescription,
  });
}

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const [initialCatalog, session, headerStore, dictionary] = await Promise.all([
    getInitialCatalogSnapshot(),
    getOptionalSession("localized-home-page"),
    headers(),
    getDictionary(locale),
  ]);
  const nonce = headerStore.get("x-nonce") ?? undefined;
  const enabledProviders = getEnabledAuthProviders();
  const home = dictionary.home;
  const shared = dictionary.shared;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "VibeBasket",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "macOS, Windows, Linux",
    description: dictionary.home.metadata.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: home.faq.entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
  const sectionIds = {
    heroTitle: "hero-title",
    who: "who",
    how: "how",
    catalog: "catalog",
    command: "command",
    faq: "faq",
  } as const;

  const iconMap: Record<string, string | undefined> = {
    cursor: "/targets/cursor.svg",
    windsurf: "/targets/windsurf.svg",
    antigravity: "/targets/antigravity.svg",
    "claude-code": "/targets/claudecode.svg",
    codex: "/targets/codex.svg",
    "cline-cli": "/targets/cline.svg",
    kiro: "/targets/kiro.svg",
    roocode: "/targets/roocode.svg",
    hermes: "/targets/hermesagent.svg",
    openclaw: "/targets/openclaw.svg",
    "deepseek-tui": "/targets/deepseek.svg",
    goose: "/targets/goose.svg",
    codebuddy: "/targets/codebuddy.svg",
    "github-copilot": "/targets/copilot.svg",
    opencode: undefined,
  };

  const marqueeTargets = [
    ...TARGET_OPTIONS.filter((target) => target.status === "supported" && iconMap[target.id]),
    ...TARGET_OPTIONS.filter((target) => target.status === "supported" && iconMap[target.id]),
  ];

  const renderTargetIcon = (targetId: string) => {
    const src = iconMap[targetId];
    const label = TARGET_OPTIONS.find((t) => t.id === targetId)?.label ?? targetId;

    if (!src) {
      return null;
    }

    return (
      <span className="text-muted-foreground">
        <Image
          src={src}
          alt={`${label} IDE icon`}
          width={28}
          height={28}
          className="h-7 w-auto object-contain"
          loading="eager"
        />
      </span>
    );
  };

  const localeLabels = {
    en: "EN",
    tr: "TR",
    es: "ES",
    zh: "中文",
    hi: "हि",
  } satisfies Record<AppLocale, string>;

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-4 sm:gap-8">
            <Link
              href={localizePath(locale, "/")}
              className="shrink-0 text-[2rem] font-bold tracking-tight text-foreground sm:text-4xl"
            >
              VibeBasket
            </Link>

            <nav className="hidden items-center gap-6 lg:flex">
              <a
                href={`#${sectionIds.who}`}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
              >
                {shared.navigation.who}
              </a>
              <span className="text-border/60 select-none">|</span>
              <a
                href={`#${sectionIds.how}`}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
              >
                {shared.navigation.how}
              </a>
              <span className="text-border/60 select-none">|</span>
              <a
                href={`#${sectionIds.catalog}`}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
              >
                {shared.navigation.catalog}
              </a>
              <span className="text-border/60 select-none">|</span>
              <a
                href={`#${sectionIds.faq}`}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent cursor-pointer"
              >
                {shared.navigation.faq}
              </a>
              <span className="text-border/60 select-none">|</span>
              <Link
                href={localizePath(locale, "/docs")}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent cursor-pointer"
              >
                {shared.navigation.documentation}
              </Link>
            </nav>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <div className="hidden xl:block">
              <LocaleSwitcher
                locale={locale}
                label={shared.localeSwitcher.label}
                localeLabels={localeLabels}
              />
            </div>

            {session?.user ? (
              <AuthMenu
                session={session}
                locale={locale}
                labels={{
                  admin: shared.auth.admin,
                  myStacks: shared.auth.myStacks,
                  stacks: shared.auth.stacks,
                  signOut: shared.auth.signOut,
                }}
              />
            ) : (
              <SignInDialog
                providers={enabledProviders}
                callbackUrl={localizePath(locale, "/")}
                locale={locale}
                triggerLabel={shared.navigation.login}
                triggerClassName="inline-flex h-10 items-center gap-2 border border-border/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground sm:px-4 sm:text-[11px] sm:tracking-[0.18em]"
              />
            )}
            <a
              href={`#${sectionIds.catalog}`}
              className="hidden md:inline-flex items-center gap-2 border border-accent bg-accent/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {shared.navigation.buildBasket}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
        <div className="border-t border-border/40 px-4 py-2 xl:hidden sm:px-6 lg:px-8">
          <LocaleSwitcher
            locale={locale}
            label={shared.localeSwitcher.label}
            localeLabels={localeLabels}
          />
        </div>
      </header>

      <script nonce={nonce} type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script nonce={nonce} type="application/ld+json">
        {JSON.stringify(faqStructuredData)}
      </script>

      <section className="border-b border-border/80">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)] lg:items-start lg:gap-14 lg:px-8 lg:py-16">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              <span className="h-2 w-2 rounded-full bg-accent" />
              {home.hero.badge.replace("24 IDE targets", `${SUPPORTED_TARGET_COUNT} IDE targets`)}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="https://github.com/mhmtayberk/VibeBasket"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 border border-border/80 bg-background/40 px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground sm:px-3.5 sm:text-[11px] sm:tracking-[0.18em]"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                {home.hero.github}
              </Link>
              <Link
                href="https://www.npmjs.com/package/vibebasket"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 border border-border/80 bg-background/40 px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground sm:px-3.5 sm:text-[11px] sm:tracking-[0.18em]"
              >
                <Package2 className="h-3.5 w-3.5" />
                {home.hero.npm}
              </Link>
            </div>

            <h1
              id={sectionIds.heroTitle}
              className="mt-8 max-w-3xl text-[2.2rem] font-semibold leading-[0.96] tracking-tight text-foreground sm:text-[3.55rem] sm:tracking-[-0.05em] lg:text-[4.45rem]"
            >
              <span className="sm:hidden">{home.hero.titleMobile}</span>
              <span className="hidden sm:inline">
                {home.hero.titleDesktop[0]}
                <br />
                {home.hero.titleDesktop[1]}
                <br />
                {home.hero.titleDesktop[2]}
                <br />
                {home.hero.titleDesktop[3]}
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-[0.98rem] leading-7 text-muted-foreground sm:mt-8 sm:text-lg sm:leading-8">
              {home.hero.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
              <a
                href={`#${sectionIds.catalog}`}
                className="inline-flex h-11 items-center justify-center gap-2 border border-accent bg-accent px-4 font-mono text-[10px] uppercase tracking-[0.16em] text-accent-foreground transition-colors hover:bg-accent/90 sm:h-12 sm:px-5 sm:text-[11px] sm:tracking-[0.18em]"
              >
                {shared.navigation.startBuildingFree}
              </a>
              <a
                href={`#${sectionIds.catalog}`}
                className="inline-flex h-11 items-center justify-center gap-2 border border-border/80 bg-card/70 px-4 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground transition-colors hover:border-accent/40 hover:text-accent sm:h-12 sm:px-5 sm:text-[11px] sm:tracking-[0.18em]"
              >
                <TerminalSquare className="h-4 w-4" />
                {shared.navigation.viewCatalog}
              </a>
              <Link
                href="https://github.com/mhmtayberk/VibeBasket/blob/main/SELF_HOSTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 border border-border/80 bg-card/70 px-4 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground transition-colors hover:border-accent/40 hover:text-accent sm:h-12 sm:px-5 sm:text-[11px] sm:tracking-[0.18em]"
              >
                <ArrowUpRight className="h-4 w-4" />
                {shared.navigation.selfHostGuide}
              </Link>
            </div>

            <div className="mt-8 overflow-hidden border-y border-border/70 py-4 sm:mt-10">
              <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent" />
                <div className="flex w-max min-w-max animate-[marquee_20s_linear_infinite] gap-3 pr-3 [will-change:transform]">
                  {marqueeTargets.map((ide, index) => (
                    <div
                      key={`${ide.id}-${index}`}
                      title={ide.label}
                      className="inline-flex h-12 min-w-10 items-center justify-center px-1.5 text-muted-foreground sm:min-w-11 sm:px-2"
                    >
                      <span className="sr-only">{ide.label}</span>
                      {renderTargetIcon(ide.id)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0 border border-border/80 bg-card/70">
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-border/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-border/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-border/80" />
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {home.hero.livePreview}
              </span>
            </div>

            <div className="flex h-full flex-col gap-5 p-4 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border border-accent bg-accent/8 p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">github-mcp</p>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        {home.hero.previewPrimaryLabel}
                      </p>
                    </div>
                    <BadgeCheck className="h-4 w-4 text-accent" />
                  </div>
                </div>

                <div className="border border-border/70 bg-background/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">typescript-strict</p>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        {home.hero.previewSecondaryLabel}
                      </p>
                    </div>
                    <Workflow className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="border border-border/70 bg-background/35 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span className="min-w-0 truncate font-mono text-[12px] text-accent">
                    $ npx vibebasket apply cj2k9x
                  </span>
                  <span className="self-start font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:self-auto">
                    {home.hero.copied}
                  </span>
                </div>
                <TypingTerminal
                  className="mt-4 space-y-1"
                  trigger="mount"
                  lines={[
                    {
                      text: home.hero.terminalLines[0],
                    },
                    {
                      text: home.hero.terminalLines[1],
                    },
                    {
                      text: home.hero.terminalLines[2],
                      className: "font-mono text-[11px] leading-6 text-accent",
                    },
                  ]}
                />
              </div>

              <div className="grid gap-3 border-t border-border/70 pt-5 sm:grid-cols-3">
                <div className="border border-border/70 bg-background/35 p-4">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <p className="mt-3 text-sm font-medium text-foreground">{home.hero.trustTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {home.hero.trustBody}
                  </p>
                </div>
                <div className="border border-border/70 bg-background/35 p-4">
                  <Lock className="h-4 w-4 text-accent" />
                  <p className="mt-3 text-sm font-medium text-foreground">
                    {home.hero.localSecretsTitle}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {home.hero.localSecretsBody}
                  </p>
                </div>
                <div className="border border-border/70 bg-background/35 p-4">
                  <BadgeCheck className="h-4 w-4 text-accent" />
                  <p className="mt-3 text-sm font-medium text-foreground">
                    {home.hero.safeRerunsTitle}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {home.hero.safeRerunsBody}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id={sectionIds.who} className="border-b border-border/80">
        <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
              {home.who.eyebrow}
            </p>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {home.who.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              {home.who.description}
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {home.who.cards.map((audience) => (
              <article key={audience.tag} className="border border-border/80 bg-card/60 p-6 group">
                <span className="inline-flex border border-border/70 bg-background/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground group-hover:border-accent/40 group-hover:text-accent transition-colors">
                  {audience.tag}
                </span>
                <h3 className="mt-5 text-xl font-semibold text-foreground">{audience.headline}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{audience.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id={sectionIds.how} className="border-b border-border/80">
        <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
              {home.how.eyebrow}
            </p>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {home.how.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              {home.how.description}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {home.how.steps.map((item) => (
              <article key={item.step} className="border border-border/80 bg-card/60 p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                  {item.step}
                </p>
                <h2 className="mt-5 text-2xl font-semibold text-foreground">{item.title}</h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id={sectionIds.catalog}>
        <CatalogGrid
          initialCatalog={initialCatalog}
          isSignedIn={Boolean(session?.user)}
          enabledProviders={enabledProviders}
          userRole={session?.user?.role}
          catalogUi={dictionary.catalogUi}
          basketUi={dictionary.basketUi}
        />
      </section>

      <section id={sectionIds.command} className="border-y border-border/80">
        <div className="mx-auto max-w-[1440px] px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <h2 className="mx-auto max-w-4xl text-[2.4rem] font-semibold tracking-tight text-foreground sm:text-7xl sm:tracking-[-0.05em]">
            {home.command.title[0]}
            <br />
            {home.command.title[1]}
          </h2>

          <div className="mx-auto mt-10 max-w-xl border border-border/80 bg-card/70 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <TypingTerminal
                className="min-w-0"
                lineClassName="truncate font-mono text-[12px] text-accent"
                trigger="mount"
                lines={[
                  {
                    text: home.command.terminalLine,
                  },
                ]}
              />
              <TerminalSquare className="h-4 w-4 shrink-0 text-foreground" />
            </div>
          </div>

          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {home.command.kicker}
          </p>
        </div>
      </section>

      <section id={sectionIds.faq} className="border-b border-border/80">
        <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
              {home.faq.eyebrow}
            </p>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {home.faq.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              {home.faq.description}
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {home.faq.entries.map((entry) => (
              <details
                key={entry.question}
                className="group border border-border/80 bg-card/60 p-5 open:border-accent/40 open:bg-card/80"
              >
                <summary className="cursor-pointer list-none pr-6 text-lg font-semibold text-foreground marker:hidden">
                  {entry.question}
                </summary>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{entry.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto mt-20 max-w-[1440px] border-t border-border/40 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-2xl font-semibold text-foreground">VibeBasket</p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground/80">
              {home.footer.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-1 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em]">
            <a
              href={`#${sectionIds.who}`}
              className="transition-colors hover:text-accent cursor-pointer"
            >
              {shared.navigation.who}
            </a>
            <span className="text-border/60 select-none">|</span>
            <a
              href={`#${sectionIds.how}`}
              className="transition-colors hover:text-accent cursor-pointer"
            >
              {shared.navigation.how}
            </a>
            <span className="text-border/60 select-none">|</span>
            <a
              href={`#${sectionIds.catalog}`}
              className="transition-colors hover:text-accent cursor-pointer"
            >
              {shared.navigation.catalog}
            </a>
            <span className="text-border/60 select-none">|</span>
            <a
              href={`#${sectionIds.command}`}
              className="transition-colors hover:text-accent cursor-pointer"
            >
              {shared.navigation.installFlow}
            </a>
            <span className="text-border/60 select-none">|</span>
            <a
              href={`#${sectionIds.faq}`}
              className="transition-colors hover:text-accent cursor-pointer"
            >
              {shared.navigation.faq}
            </a>
            <span className="text-border/60 select-none">|</span>
            <Link
              href={localizePath(locale, "/docs")}
              className="transition-colors hover:text-accent cursor-pointer"
            >
              {shared.navigation.documentation}
            </Link>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center border-t border-border/20 pt-8">
          <p className="flex items-center justify-center gap-1.5 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
            {home.footer.madeWith} <span className="text-accent animate-pulse">♥</span>{" "}
            {home.footer.by}{" "}
            <span className="cursor-default text-foreground transition-colors duration-200 hover:text-accent">
              {home.footer.vibeCoding}
            </span>{" "}
            {home.footer.for}{" "}
            <span className="font-medium text-accent">{home.footer.vibeCoders}</span>
          </p>
        </div>
      </footer>

      <FloatingBasket
        isSignedIn={Boolean(session?.user)}
        enabledProviders={enabledProviders}
        userRole={session?.user?.role}
        copy={dictionary.basketUi}
      />
      <TopToTopButton />
    </main>
  );
}
