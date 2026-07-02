import { auth, getEnabledAuthProviders } from "@/auth";
import { AuthMenu } from "@/components/auth/AuthMenu";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { FloatingBasket } from "@/components/basket/FloatingBasket";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { TopToTopButton } from "@/components/layout/TopToTopButton";
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
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [initialCatalog, session, headerStore] = await Promise.all([
    getInitialCatalogSnapshot(),
    auth(),
    headers(),
  ]);
  const nonce = headerStore.get("x-nonce") ?? undefined;
  const enabledProviders = getEnabledAuthProviders();
  const faqEntries = [
    {
      question: "Does VibeBasket ever receive my runtime API keys?",
      answer:
        "No. Bundle manifests do not carry end-user runtime secrets. When a selected MCP needs credentials, the CLI resolves that value locally during apply and writes it into the target tool's own config surface on your machine.",
    },
    {
      question: "What happens if my IDE already has MCPs, skills, or rules configured?",
      answer:
        "VibeBasket merges into the target's supported config surface instead of pretending every file is blank. Existing blocks stay in place, VibeBasket-managed blocks remain idempotent, and unchanged MCP state is skipped so repeated applies do not keep rewriting the same target.",
    },
    {
      question: "What do Verified, Official, and Community mean?",
      answer:
        "Verified means the item was curated by VibeBasket. Official means the upstream source exposed an explicit owner- or vendor-certified signal. Community is everything else that still passes the catalog normalization and deduplication pipeline.",
    },
    {
      question: "Can I self-host VibeBasket for my team?",
      answer:
        "Yes. The web app, CLI, catalog sync, auth, admin tools, and backup flows all live in this repo. The default self-hosting shape is one VPS, one app instance, and one SQLite database with persistent storage and external backups.",
    },
    {
      question: "Is re-running npx vibebasket apply safe?",
      answer:
        "That is the default expectation. The CLI is backup-aware, skips no-op MCP writes, and keeps target-specific install behavior idempotent so the same basket can be re-applied without turning every run into a destructive rewrite.",
    },
  ] as const;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "VibeBasket",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "macOS, Windows, Linux",
    description:
      "Bundle trusted MCP servers, reusable agent skills, and project rules into one shareable install flow for AI coding tools.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries.map((entry) => ({
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

    if (src) {
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
    }

    return null;
  };
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-4 sm:gap-8">
            <Link
              href="/"
              className="shrink-0 text-[2rem] font-bold tracking-tight text-foreground sm:text-4xl"
            >
              VibeBasket
            </Link>

            <nav className="hidden items-center gap-6 lg:flex">
              <a
                href={`#${sectionIds.who}`}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
              >
                Who it's for
              </a>
              <span className="text-border/60 select-none">|</span>
              <a
                href={`#${sectionIds.how}`}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
              >
                How it works
              </a>
              <span className="text-border/60 select-none">|</span>
              <a
                href={`#${sectionIds.catalog}`}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
              >
                Catalog
              </a>
              <span className="text-border/60 select-none">|</span>
              <a
                href={`#${sectionIds.command}`}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent cursor-pointer"
              >
                Install flow
              </a>
              <span className="text-border/60 select-none">|</span>
              <a
                href={`#${sectionIds.faq}`}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent cursor-pointer"
              >
                FAQ
              </a>
              <span className="text-border/60 select-none">|</span>
              <Link
                href="/docs"
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent cursor-pointer"
              >
                Documentation
              </Link>
            </nav>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            {session?.user ? (
              <AuthMenu session={session} />
            ) : (
              <SignInDialog
                providers={enabledProviders}
                callbackUrl="/"
                triggerLabel="Login"
                triggerClassName="inline-flex h-10 items-center gap-2 border border-border/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground sm:px-4 sm:text-[11px] sm:tracking-[0.18em]"
              />
            )}
            <a
              href={`#${sectionIds.catalog}`}
              className="hidden md:inline-flex items-center gap-2 border border-accent bg-accent/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Build your basket
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </header>

      <script nonce={nonce} type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script nonce={nonce} type="application/ld+json">
        {JSON.stringify(faqStructuredData)}
      </script>

      <section className="border-b border-border/80" aria-labelledby={sectionIds.heroTitle}>
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-4 py-10 sm:gap-14 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:px-8 lg:py-20">
          <div className="flex min-w-0 flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 border border-border/80 bg-card/70 px-2.5 py-1.5 sm:px-3">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent sm:text-[11px] sm:tracking-[0.18em]">
                {`Open source · ${SUPPORTED_TARGET_COUNT} IDE targets`}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Link
                href="https://github.com/mhmtayberk/VibeBasket"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 border border-border/80 bg-background/40 px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground sm:px-3.5 sm:text-[11px] sm:tracking-[0.18em]"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                GitHub
              </Link>
              <Link
                href="https://www.npmjs.com/package/vibebasket"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 border border-border/80 bg-background/40 px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground sm:px-3.5 sm:text-[11px] sm:tracking-[0.18em]"
              >
                <Package2 className="h-3.5 w-3.5" />
                npm
              </Link>
            </div>

            <h1
              id={sectionIds.heroTitle}
              className="mt-8 max-w-3xl text-[2.2rem] font-semibold leading-[0.96] tracking-tight text-foreground sm:text-[3.55rem] sm:tracking-[-0.05em] lg:text-[4.45rem]"
            >
              <span className="sm:hidden">Bundle your AI dev setup. Share it with one link.</span>
              <span className="hidden sm:inline">
                Bundle your AI
                <br />
                dev setup.
                <br />
                Share it with
                <br />
                one link.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-[0.98rem] leading-7 text-muted-foreground sm:mt-8 sm:text-lg sm:leading-8">
              Curate trusted MCP servers, reusable skills, and project rules. Generate one install
              command that travels cleanly across Cursor, Windsurf, VS Code, and the rest of your AI
              coding stack.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
              <a
                href={`#${sectionIds.catalog}`}
                className="inline-flex h-11 items-center justify-center gap-2 border border-accent bg-accent px-4 font-mono text-[10px] uppercase tracking-[0.16em] text-accent-foreground transition-colors hover:bg-accent/90 sm:h-12 sm:px-5 sm:text-[11px] sm:tracking-[0.18em]"
              >
                Start building free
              </a>
              <a
                href={`#${sectionIds.catalog}`}
                className="inline-flex h-11 items-center justify-center gap-2 border border-border/80 bg-card/70 px-4 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground transition-colors hover:border-accent/40 hover:text-accent sm:h-12 sm:px-5 sm:text-[11px] sm:tracking-[0.18em]"
              >
                <TerminalSquare className="h-4 w-4" />
                View catalog
              </a>
              <Link
                href="https://github.com/mhmtayberk/VibeBasket/blob/main/SELF_HOSTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 border border-border/80 bg-card/70 px-4 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground transition-colors hover:border-accent/40 hover:text-accent sm:h-12 sm:px-5 sm:text-[11px] sm:tracking-[0.18em]"
              >
                <ArrowUpRight className="h-4 w-4" />
                Self-host guide
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
                Live preview
              </span>
            </div>

            <div className="flex h-full flex-col gap-5 p-4 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border border-accent bg-accent/8 p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">github-mcp</p>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        repository context
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
                        coding rules
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
                    copied
                  </span>
                </div>
                <div className="mt-4 space-y-1 font-mono text-[11px] leading-6 text-muted-foreground">
                  <p>&gt; Fetching trusted basket configuration...</p>
                  <p>&gt; Writing MCP config for your selected targets...</p>
                  <p className="text-accent">
                    &gt; Context ready in Cursor, Windsurf, and VS Code.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 border-t border-border/70 pt-5 sm:grid-cols-3">
                <div className="border border-border/70 bg-background/35 p-4">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <p className="mt-3 text-sm font-medium text-foreground">Trusted discovery</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Official registries and curated records, deduped into one catalog.
                  </p>
                </div>
                <div className="border border-border/70 bg-background/35 p-4">
                  <Lock className="h-4 w-4 text-accent" />
                  <p className="mt-3 text-sm font-medium text-foreground">Local secrets</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Sensitive values stay on your machine during apply.
                  </p>
                </div>
                <div className="border border-border/70 bg-background/35 p-4">
                  <BadgeCheck className="h-4 w-4 text-accent" />
                  <p className="mt-3 text-sm font-medium text-foreground">Safe re-runs</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Idempotent writes with backups so setup changes stay reversible.
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
              Who is this for
            </p>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Built for teams that move fast.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Whether you work solo or run a team, VibeBasket eliminates the friction of setting up
              AI coding tools one machine at a time.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                tag: "Solo Developer",
                headline: "One command, every editor.",
                body: "Stop copy-pasting MCP configs across Cursor, Windsurf, and VS Code. Build a bundle once and apply it everywhere with a single npx command.",
              },
              {
                tag: "Startup Team",
                headline: "Onboard in minutes, not hours.",
                body: "Share a bundle URL with new hires. They run one command and get the exact same MCPs, skills, and rules as the rest of the team — no manual setup.",
              },
              {
                tag: "Platform Maintainer",
                headline: "Curate trusted defaults.",
                body: "Publish verified MCP servers and project rules your users can install with zero configuration. Control what goes into every environment without shipping config files.",
              },
            ].map((audience) => (
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
              How it works
            </p>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Three steps from zero to configured.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              No config files to copy. No IDE settings to hunt down. Just browse, bundle, and apply.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Browse trusted components",
                body: "Catalog entries are pulled from curated data and trusted upstream sources, then normalized and deduplicated.",
              },
              {
                step: "02",
                title: "Assemble your basket",
                body: "Select MCPs, skills, and rules directly from the builder. The UI keeps the basket state visible and reversible.",
              },
              {
                step: "03",
                title: "Apply with one command",
                body: "Generate a single install command and apply the same setup across multiple editors without manual reconfiguration.",
              },
            ].map((item) => (
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
        />
      </section>

      <section id={sectionIds.command} className="border-y border-border/80">
        <div className="mx-auto max-w-[1440px] px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <h2 className="mx-auto max-w-4xl text-[2.4rem] font-semibold tracking-tight text-foreground sm:text-7xl sm:tracking-[-0.05em]">
            Stop reconfiguring.
            <br />
            Start coding.
          </h2>

          <div className="mx-auto mt-10 max-w-xl border border-border/80 bg-card/70 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate font-mono text-[12px] text-accent">
                $ npx vibebasket apply &lt;bundle-url&gt;
              </span>
              <TerminalSquare className="h-4 w-4 shrink-0 text-foreground" />
            </div>
          </div>

          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Open source. Low ceremony. Built for teams that move fast.
          </p>
        </div>
      </section>

      <section id={sectionIds.faq} className="border-b border-border/80">
        <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">FAQ</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              The questions that usually come up first.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Short answers for the trust, install, and self-hosting details people usually want
              before they standardize a workflow around VibeBasket.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {faqEntries.map((entry) => (
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

      <footer className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 border-t border-border/40 mt-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-2xl font-semibold text-foreground">VibeBasket</p>
            <p className="mt-3 max-w-xl leading-7 text-muted-foreground/80 text-sm">
              AI-engineered setup infrastructure for teams that want reproducible context across
              modern coding tools.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-1 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] items-center">
            <a
              href={`#${sectionIds.who}`}
              className="transition-colors hover:text-accent cursor-pointer"
            >
              Who it's for
            </a>
            <span className="text-border/60 select-none">|</span>
            <a
              href={`#${sectionIds.how}`}
              className="transition-colors hover:text-accent cursor-pointer"
            >
              How it works
            </a>
            <span className="text-border/60 select-none">|</span>
            <a
              href={`#${sectionIds.catalog}`}
              className="transition-colors hover:text-accent cursor-pointer"
            >
              Catalog
            </a>
            <span className="text-border/60 select-none">|</span>
            <a
              href={`#${sectionIds.command}`}
              className="transition-colors hover:text-accent cursor-pointer"
            >
              Install flow
            </a>
            <span className="text-border/60 select-none">|</span>
            <a
              href={`#${sectionIds.faq}`}
              className="transition-colors hover:text-accent cursor-pointer"
            >
              FAQ
            </a>
            <span className="text-border/60 select-none">|</span>
            <Link href="/docs" className="transition-colors hover:text-accent cursor-pointer">
              Documentation
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/20 flex justify-center items-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5 justify-center text-center">
            Made with <span className="text-accent animate-pulse">♥</span> by{" "}
            <span className="text-foreground hover:text-accent transition-colors duration-200 cursor-default">
              Vibe Coding
            </span>{" "}
            for <span className="text-accent font-medium">Vibe Coders</span>
          </p>
        </div>
      </footer>

      <FloatingBasket
        isSignedIn={Boolean(session?.user)}
        enabledProviders={enabledProviders}
        userRole={session?.user?.role}
      />
      <TopToTopButton />
    </main>
  );
}
