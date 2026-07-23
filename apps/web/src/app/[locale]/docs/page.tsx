import { getEnabledAuthProviders } from "@/auth";
import { AuthMenu } from "@/components/auth/AuthMenu";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { DocSearchBar } from "@/components/docs/DocSearchBar";
import { MobileTabSelector } from "@/components/docs/MobileTabSelector";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { type AppLocale, SUPPORTED_LOCALES, isSupportedLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizePath } from "@/i18n/locale-routing";
import { buildLocaleMetadata } from "@/i18n/metadata";
import { getOptionalSession } from "@/lib/auth-safe";
import { resolvePublicBaseUrl } from "@/lib/public-url";
import { BookOpen, KeyRound, Layers, Play, TerminalSquare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocsTabAdapters } from "../../docs/tabs/DocsTabAdapters";
import { DocsTabCli } from "../../docs/tabs/DocsTabCli";
import { DocsTabDelimiters } from "../../docs/tabs/DocsTabDelimiters";
import { DocsTabGettingStarted } from "../../docs/tabs/DocsTabGettingStarted";
import { DocsTabHub } from "../../docs/tabs/DocsTabHub";
import { DocsTabMcp } from "../../docs/tabs/DocsTabMcp";
import { DocsTabSecurity } from "../../docs/tabs/DocsTabSecurity";
import { DocsTabSelfHosting } from "../../docs/tabs/DocsTabSelfHosting";

export const dynamic = "force-dynamic";

interface SearchParams {
  tab?: string;
  q?: string;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const [{ locale }, { tab }] = await Promise.all([params, searchParams]);

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const dictionary = await getDictionary(locale);
  const docs = dictionary.docs;

  const meta =
    tab === "getting-started"
      ? docs.metadataGettingStarted
      : tab === "cli"
        ? docs.metadataCli
        : tab === "mcp"
          ? docs.metadataMcp
          : tab === "adapters"
            ? docs.metadataAdapters
            : tab === "delimiters"
              ? docs.metadataDelimiters
              : tab === "security"
                ? docs.metadataSecurity
                : tab === "self-hosting"
                  ? docs.metadataSelfHosting
                  : docs.metadataHub;

  const localizedDocsPath = tab ? `/docs?tab=${tab}` : "/docs";
  const languageAlternates = Object.fromEntries(
    SUPPORTED_LOCALES.map((candidate) => [
      candidate,
      tab ? `/${candidate}/docs?tab=${tab}` : `/${candidate}/docs`,
    ]),
  );

  return {
    ...buildLocaleMetadata({
      locale,
      pathname: "/docs",
      title: meta.title,
      description: meta.description,
    }),
    metadataBase: new URL(resolvePublicBaseUrl()),
    alternates: {
      canonical: tab
        ? `${localizePath(locale, "/docs")}?tab=${tab}`
        : localizePath(locale, "/docs"),
      languages: {
        ...languageAlternates,
        "x-default": tab ? `/en/docs?tab=${tab}` : "/en/docs",
      },
    },
  };
}

export default async function LocalizedDocsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ locale }, session, resolvedSearchParams, dictionary] = await Promise.all([
    params,
    getOptionalSession("localized-docs-page"),
    searchParams,
    params.then(async ({ locale }) => (isSupportedLocale(locale) ? getDictionary(locale) : null)),
  ]);

  if (!isSupportedLocale(locale) || !dictionary) {
    notFound();
  }

  const enabledProviders = getEnabledAuthProviders();
  const docs = dictionary.docs;
  const shared = dictionary.shared;
  const ALLOWED_TABS = [
    "hub",
    "getting-started",
    "cli",
    "mcp",
    "adapters",
    "delimiters",
    "security",
    "self-hosting",
  ] as const;
  const requestedTab = resolvedSearchParams.tab;
  const activeTab: (typeof ALLOWED_TABS)[number] =
    requestedTab && ALLOWED_TABS.includes(requestedTab as (typeof ALLOWED_TABS)[number])
      ? (requestedTab as (typeof ALLOWED_TABS)[number])
      : "hub";

  const searchQuery = resolvedSearchParams.q?.slice(0, 100).toLowerCase().trim() ?? "";

  const guides = [
    {
      title: docs.guideCards.quickStart.title,
      description: docs.guideCards.quickStart.description,
      icon: <Play className="h-5 w-5 text-[#a0fdda] animate-pulse" />,
      linkText: docs.guideCards.quickStart.linkText,
      tabKey: "getting-started",
      keywords:
        "quick start install setup begin fast integration mcp catalog register workspace onboarding guide",
    },
    {
      title: docs.guideCards.cli.title,
      description: docs.guideCards.cli.description,
      icon: <TerminalSquare className="h-5 w-5 text-[#33bbc5]" />,
      linkText: docs.guideCards.cli.linkText,
      tabKey: "cli",
      keywords:
        "cli terminal command apply install dry-run force no-verify scope deploy reference documentation configuration",
    },
    {
      title: docs.guideCards.mcp.title,
      description: docs.guideCards.mcp.description,
      icon: <TerminalSquare className="h-5 w-5 text-[#a0fdda]" />,
      linkText: docs.guideCards.mcp.linkText,
      tabKey: "mcp",
      keywords:
        "mcp model context protocol stdio local server ide integration target guide install planning apply rollback stack",
    },
    {
      title: docs.guideCards.adapters.title,
      description: docs.guideCards.adapters.description,
      icon: <Layers className="h-5 w-5 text-[#e040fb]" />,
      linkText: docs.guideCards.adapters.linkText,
      tabKey: "adapters",
      keywords: "ide adapter editor ide cursor windsurf vscode config path target compatibility",
    },
    {
      title: docs.guideCards.delimiters.title,
      description: docs.guideCards.delimiters.description,
      icon: <BookOpen className="h-5 w-5 text-[#ffb74d]" />,
      linkText: docs.guideCards.delimiters.linkText,
      tabKey: "delimiters",
      keywords: "delimiter block comment idempotent merge shell markdown yaml config safe write",
    },
    {
      title: docs.guideCards.security.title,
      description: docs.guideCards.security.description,
      icon: <KeyRound className="h-5 w-5 text-[#e040fb]" />,
      linkText: docs.guideCards.security.linkText,
      tabKey: "security",
      keywords: "security secret zero-trust rate limit header csp csrf api protection credential",
    },
    {
      title: docs.guideCards.selfHosting.title,
      description: docs.guideCards.selfHosting.description,
      icon: <TerminalSquare className="h-5 w-5 text-[#33bbc5]" />,
      linkText: docs.guideCards.selfHosting.linkText,
      tabKey: "self-hosting",
      keywords: "self-host docker kubernetes helm deploy nodejs server infrastructure backup s3 r2",
    },
  ];

  const filteredGuides = searchQuery
    ? guides.filter(
        (g) =>
          g.title.toLowerCase().includes(searchQuery) ||
          g.description.toLowerCase().includes(searchQuery) ||
          g.keywords.toLowerCase().includes(searchQuery),
      )
    : guides;

  const localeLabels = {
    en: "EN",
    tr: "TR",
    es: "ES",
    zh: "中文",
    hi: "हि",
    ru: "RU",
  } satisfies Record<AppLocale, string>;

  const tabLabels = {
    hub: docs.shell.documentationHub,
    "getting-started": docs.shell.tabs.gettingStarted,
    cli: docs.shell.tabs.cli,
    mcp: docs.shell.tabs.mcp,
    adapters: docs.shell.tabs.adapters,
    delimiters: docs.shell.tabs.delimiters,
    security: docs.shell.tabs.security,
    "self-hosting": docs.shell.tabs.selfHosting,
  };

  const docsResponsiveCss = `
    .vb-docs-mobile-tabs { display: block; }
    .vb-docs-desktop-sidebar { display: none; }

    @media (min-width: 1024px) {
      .vb-docs-mobile-tabs { display: none; }
      .vb-docs-desktop-sidebar { display: block; }
    }
  `;

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground antialiased">
      <style>{docsResponsiveCss}</style>
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-6 md:items-center lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-8">
            <Link
              href={localizePath(locale, "/")}
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              VibeBasket
            </Link>

            <nav className="hidden items-center gap-3 lg:flex">
              <Link
                href={`${localizePath(locale, "/")}#who`}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
              >
                {shared.navigation.who}
              </Link>
              <span className="text-border/60 select-none">|</span>
              <Link
                href={`${localizePath(locale, "/")}#how`}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
              >
                {shared.navigation.how}
              </Link>
              <span className="text-border/60 select-none">|</span>
              <Link
                href={`${localizePath(locale, "/")}#catalog`}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
              >
                {shared.navigation.catalog}
              </Link>
              <span className="text-border/60 select-none">|</span>
              <Link
                href={localizePath(locale, "/docs")}
                className={`font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:text-accent ${
                  activeTab === "hub" ? "text-accent font-semibold" : "text-muted-foreground"
                }`}
              >
                {docs.shell.tabs.hub}
              </Link>
            </nav>
          </div>

          <div className="flex w-full min-w-0 items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-3">
            <div className="hidden xl:block">
              <LocaleSwitcher
                locale={locale}
                label={shared.localeSwitcher.label}
                localeLabels={localeLabels}
              />
            </div>

            <DocSearchBar
              initialQuery={searchQuery}
              locale={locale}
              placeholder={docs.shell.searchPlaceholder}
              ariaLabel={docs.shell.searchAriaLabel}
            />

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
                callbackUrl={localizePath(locale, "/docs")}
                locale={locale}
                triggerLabel={shared.navigation.login}
                triggerClassName="inline-flex items-center gap-2 border border-border/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
              />
            )}

            <Link
              href={`${localizePath(locale, "/")}#catalog`}
              className="hidden xl:inline-flex items-center gap-2 border border-accent bg-accent/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {shared.navigation.buildBasket}
            </Link>
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

      <div className="vb-docs-mobile-tabs">
        <MobileTabSelector
          activeTab={activeTab}
          locale={locale}
          tabLabels={tabLabels}
          ariaLabel={docs.shell.mobileSectionLabel}
        />
      </div>

      <main className="mx-auto max-w-[1440px] overflow-x-clip px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="vb-docs-desktop-sidebar">
            <div className="sticky top-28 space-y-3 border border-border/80 bg-card/60 p-4">
              {ALLOWED_TABS.map((tabName) => (
                <Link
                  key={tabName}
                  href={`${localizePath(locale, "/docs")}?tab=${tabName}`}
                  className={`block border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                    activeTab === tabName
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border/70 text-muted-foreground hover:border-accent/40 hover:text-foreground"
                  }`}
                >
                  {tabLabels[tabName as keyof typeof tabLabels]}
                </Link>
              ))}
            </div>
          </aside>

          <div className="min-w-0 overflow-x-clip">
            {activeTab === "hub" ? (
              <DocsTabHub
                locale={locale}
                searchQuery={searchQuery}
                guides={filteredGuides}
                shell={docs.shell}
              />
            ) : null}
            {activeTab === "getting-started" ? <DocsTabGettingStarted locale={locale} /> : null}
            {activeTab === "cli" ? <DocsTabCli locale={locale} /> : null}
            {activeTab === "mcp" ? <DocsTabMcp locale={locale} /> : null}
            {activeTab === "adapters" ? <DocsTabAdapters locale={locale} /> : null}
            {activeTab === "delimiters" ? <DocsTabDelimiters locale={locale} /> : null}
            {activeTab === "security" ? <DocsTabSecurity locale={locale} /> : null}
            {activeTab === "self-hosting" ? <DocsTabSelfHosting locale={locale} /> : null}
          </div>
        </section>
      </main>
    </div>
  );
}
