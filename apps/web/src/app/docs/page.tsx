import { BookOpen, Cpu, Server, Layers, Play, Power, TerminalSquare, KeyRound } from "lucide-react";
import Link from "next/link";
import { AuthMenu } from "@/components/auth/AuthMenu";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { DocSearchBar } from "@/components/docs/DocSearchBar";
import { DocsTabAdapters } from "./tabs/DocsTabAdapters";
import { DocsTabCli } from "./tabs/DocsTabCli";
import { DocsTabDelimiters } from "./tabs/DocsTabDelimiters";
import { DocsTabGettingStarted } from "./tabs/DocsTabGettingStarted";
import { DocsTabHub } from "./tabs/DocsTabHub";
import { DocsTabSecurity } from "./tabs/DocsTabSecurity";
import { DocsTabSelfHosting } from "./tabs/DocsTabSelfHosting";
import { auth, getEnabledAuthProviders } from "@/auth";

export const metadata = {
  title: "VibeBasket Documentation | AI-Engineered Infrastructure",
  description:
    "Deep architectural guides, CLI command specifications, multi-IDE adapters, block delimiter engines, and self-hosting procedures.",
};

interface SearchParams {
  tab?: string;
  q?: string;
}

export default async function DocsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const enabledProviders = getEnabledAuthProviders();
  const resolvedSearchParams = await searchParams;
  const ALLOWED_TABS = [
    "hub",
    "getting-started",
    "cli",
    "adapters",
    "delimiters",
    "security",
    "self-hosting",
  ];
  const activeTab = ALLOWED_TABS.includes(resolvedSearchParams.tab || "")
    ? resolvedSearchParams.tab || "hub"
    : "hub";

  // Restrict query length to 100 characters to block extremely long payloads (protects against ReDoS & injection attacks)
  const searchQuery = resolvedSearchParams.q?.slice(0, 100).toLowerCase().trim() ?? "";

  const sidebarNav = [
    {
      title: "Builder",
      icon: <Layers className="h-4.5 w-4.5" />,
      href: "/",
    },
    {
      title: "Documentation",
      icon: <BookOpen className="h-4.5 w-4.5" />,
      href: "/docs",
      active: true,
    },
  ];

  const allGuides = [
    {
      title: "Quick Start Guide",
      description:
        "Get your first AI context bundle running in under 2 minutes. Browse the catalog, pick MCP servers and skills, generate a bundle URL, and apply it locally with the CLI.",
      icon: <Play className="h-5 w-5 text-[#a0fdda] animate-pulse" />,
      linkText: "Read quickstart",
      tabKey: "getting-started",
      keywords:
        "quick start install setup begin fast integration mcp catalog register workspace onboarding guide",
    },
    {
      title: "CLI Reference",
      description:
        "Complete reference for the `vibebasket apply` command: bundle URLs, the `--force` flag, `--scope` overrides, and `--dry-run` preview mode.",
      icon: <TerminalSquare className="h-5 w-5 text-[#33bbc5]" />,
      linkText: "View CLI reference",
      tabKey: "cli",
      keywords:
        "cli command terminal apply flags options parameters arguments run exec automation non-interactive overwrite",
    },
    {
      title: "IDE Adapters",
      description:
        "All 24 supported targets: Cursor, Windsurf, VS Code, Claude Code, Gemini CLI, Codex CLI, Zed, Junie, Kiro, DeepSeek-TUI, Continue, Roo Code, Hermes, OpenClaw, Cline CLI, Antigravity, GitHub Copilot, Void Editor, Aider, Cortex Code, Goose, IBM Bob, CodeBuddy, and OpenCode.",
      icon: <Power className="h-5 w-5 text-[#ff5722]" />,
      linkText: "Explore adapters",
      tabKey: "adapters",
      keywords:
        "ide adapters cursor windsurf vscode claude codex gemini zed kiro junie deepseek continue roocode hermes openclaw cline antigravity editors configuration files tools compatibility integration settings json yaml toml",
    },
    {
      title: "Block Delimiter Engine",
      description:
        "How VibeBasket writes idempotent rule and skill blocks into `.clinerules`, `.hermesrules`, and `.openclawrules` files without ever touching surrounding developer content.",
      icon: <Cpu className="h-5 w-5 text-[#ffb300]" />,
      linkText: "Read spec",
      tabKey: "delimiters",
      keywords:
        "delimiter block idempotent rules merge clinerules hermesrules openclawrules custom prompt instructions safe parsing updates append write files regex formatting marker marker-based engine",
    },
    {
      title: "Credentials & Security",
      description:
        "VibeBasket never stores API keys or tokens. All secrets are prompted and injected locally by the CLI. The cloud database holds only bundle metadata.",
      icon: <KeyRound className="h-5 w-5 text-[#e040fb]" />,
      linkText: "Security model",
      tabKey: "security",
      keywords:
        "security secrets api keys credentials zero trust prompt injection local storage sensitive tokens database metadata privacy protection data leakage encryption shielding shield",
    },
    {
      title: "Self-Hosting",
      description:
        "Deploy VibeBasket on your own infrastructure. Environment variables, SQLite WAL mode, OAuth provider gating, TRUST_PROXY for Cloudflare/Nginx, and the admin dashboard.",
      icon: <Server className="h-5 w-5 text-[#a0fdda]" />,
      linkText: "Self-hosting guide",
      tabKey: "self-hosting",
      keywords:
        "self hosting deploy production sqlite oauth admin docker dockerfile compose volumes ports deployment manual reverse proxy nginx cloudflare network concurrency database-url path environment variables",
    },
  ];

  const guides = searchQuery
    ? allGuides.filter(
        (g) =>
          g.title.toLowerCase().includes(searchQuery) ||
          g.description.toLowerCase().includes(searchQuery) ||
          g.keywords.toLowerCase().includes(searchQuery),
      )
    : allGuides;

  // Navigation active status helper
  const isLinkActive = (tabName: string) => activeTab === tabName;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased relative selection:bg-accent/30 selection:text-foreground">
      {/* Top Navbar - 100% Identical to homepage header menu */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-[#101412]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl hover:text-[#a0fdda] transition-colors cursor-pointer select-none"
            >
              VibeBasket
            </Link>

            <nav className="hidden items-center gap-6 lg:flex">
              <Link
                href="/#how"
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#bdc9c2] transition-colors hover:text-[#a0fdda] cursor-pointer"
              >
                How it works
              </Link>
              <Link
                href="/#catalog"
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#bdc9c2] transition-colors hover:text-[#a0fdda] cursor-pointer"
              >
                Catalog
              </Link>
              <Link
                href="/#command"
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#bdc9c2] transition-colors hover:text-[#a0fdda] cursor-pointer"
              >
                Install flow
              </Link>
              <Link
                href="/docs"
                className={`font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:text-[#a0fdda] cursor-pointer ${
                  activeTab === "hub" ? "text-[#a0fdda] font-semibold" : "text-[#bdc9c2]"
                }`}
              >
                Documentation
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <DocSearchBar initialQuery={searchQuery} />

            {session?.user ? (
              <AuthMenu session={session} />
            ) : (
              <SignInDialog
                providers={enabledProviders}
                callbackUrl="/docs"
                triggerLabel="Login"
                triggerClassName="inline-flex items-center gap-2 border border-[#3e4944] bg-[#181d1a] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#bdc9c2] transition-colors hover:border-[#a0fdda] hover:text-[#a0fdda] hover:bg-[#262b28] cursor-pointer rounded-[2px]"
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Columns - Extremely Spacious for Breathing Room */}
      <div className="mx-auto flex max-w-[1440px] px-0 gap-0 pt-0 min-h-[calc(100vh-73px)] relative">
        {/* Sidebar Navigation - Flat OLED-Dark Panel with Sharp Geometric Borders */}
        <aside className="hidden lg:flex w-72 shrink-0 border-r border-[#3e4944]/60 bg-[#181d1a] sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto custom-scrollbar flex-col justify-between select-none">
          <div>
            {/* Setup Builder Widget Mockup (Spacious & Clean Layout, No Rounded Card Border) */}
            <div className="p-6 border-b border-[#3e4944]/60">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-[2px] bg-[#a0fdda]/10 border border-[#a0fdda]/20 flex items-center justify-center shrink-0">
                  <Layers className="h-5 w-5 text-[#a0fdda]" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-mono text-xs font-semibold text-foreground tracking-wider uppercase">
                    Setup Builder
                  </div>
                  <div className="font-mono text-[10px] text-[#bdc9c2]/60 truncate tracking-wider mt-0.5">
                    0 items selected
                  </div>
                </div>
              </div>
            </div>

            <div className="py-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#bdc9c2]/50 mb-4 ml-6">
                Core Concepts
              </p>
              <nav className="space-y-1 font-mono text-[11px] uppercase tracking-wider">
                <Link
                  href="/docs?tab=getting-started"
                  className={`block px-6 py-3.5 transition-all duration-300 cursor-pointer border-l-2 hover:bg-[#262b28]/60 hover:text-[#a0fdda] hover:pl-7 ${
                    isLinkActive("getting-started")
                      ? "border-[#a0fdda] text-[#a0fdda] bg-[#a0fdda]/10 font-semibold pl-7"
                      : "border-transparent text-[#bdc9c2]"
                  }`}
                >
                  Getting Started
                </Link>
                <Link
                  href="/docs?tab=cli"
                  className={`block px-6 py-3.5 transition-all duration-300 cursor-pointer border-l-2 hover:bg-[#262b28]/60 hover:text-[#a0fdda] hover:pl-7 ${
                    isLinkActive("cli")
                      ? "border-[#a0fdda] text-[#a0fdda] bg-[#a0fdda]/10 font-semibold pl-7"
                      : "border-transparent text-[#bdc9c2]"
                  }`}
                >
                  CLI Reference
                </Link>
                <Link
                  href="/docs?tab=adapters"
                  className={`block px-6 py-3.5 transition-all duration-300 cursor-pointer border-l-2 hover:bg-[#262b28]/60 hover:text-[#a0fdda] hover:pl-7 ${
                    isLinkActive("adapters")
                      ? "border-[#a0fdda] text-[#a0fdda] bg-[#a0fdda]/10 font-semibold pl-7"
                      : "border-transparent text-[#bdc9c2]"
                  }`}
                >
                  IDE Adapters
                </Link>
                <Link
                  href="/docs?tab=delimiters"
                  className={`block px-6 py-3.5 transition-all duration-300 cursor-pointer border-l-2 hover:bg-[#262b28]/60 hover:text-[#a0fdda] hover:pl-7 ${
                    isLinkActive("delimiters")
                      ? "border-[#a0fdda] text-[#a0fdda] bg-[#a0fdda]/10 font-semibold pl-7"
                      : "border-transparent text-[#bdc9c2]"
                  }`}
                >
                  Block Delimiters
                </Link>
                <Link
                  href="/docs?tab=security"
                  className={`block px-6 py-3.5 transition-all duration-300 cursor-pointer border-l-2 hover:bg-[#262b28]/60 hover:text-[#a0fdda] hover:pl-7 ${
                    isLinkActive("security")
                      ? "border-[#a0fdda] text-[#a0fdda] bg-[#a0fdda]/10 font-semibold pl-7"
                      : "border-transparent text-[#bdc9c2]"
                  }`}
                >
                  Secret Security
                </Link>
                <Link
                  href="/docs?tab=self-hosting"
                  className={`block px-6 py-3.5 transition-all duration-300 cursor-pointer border-l-2 hover:bg-[#262b28]/60 hover:text-[#a0fdda] hover:pl-7 ${
                    isLinkActive("self-hosting")
                      ? "border-[#a0fdda] text-[#a0fdda] bg-[#a0fdda]/10 font-semibold pl-7"
                      : "border-transparent text-[#bdc9c2]"
                  }`}
                >
                  Self-hosting Guide
                </Link>
              </nav>
            </div>
          </div>

          {/* Sidebar Footer — back-to-builder shortcut */}
          <div className="border-t border-[#3e4944]/60 p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#bdc9c2]/35 mb-2 pl-2">
              v0.9 · 24 adapters
            </p>
          </div>
        </aside>

        {/* Main Content Area - Extremely Spacious (py-16, space-y-24) */}
        <main className="flex-1 px-12 sm:px-16 lg:px-24 pt-20 pb-36 max-w-5xl min-w-0">
          {/* Active tab content switcher */}
          {activeTab === "hub" && <DocsTabHub searchQuery={searchQuery} guides={guides} />}

          {activeTab === "getting-started" && <DocsTabGettingStarted />}

          {activeTab === "cli" && <DocsTabCli />}

          {activeTab === "adapters" && <DocsTabAdapters />}

          {activeTab === "delimiters" && <DocsTabDelimiters />}

          {activeTab === "security" && <DocsTabSecurity />}

          {activeTab === "self-hosting" && <DocsTabSelfHosting />}
        </main>
      </div>

      {/* Footer Block - 100% Identical to homepage centered footer menu */}
      <footer className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12 py-10 border-t border-[#3e4944]/50 mt-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground tracking-tighter">VibeBasket</p>
            <p className="mt-3 max-w-xl leading-7 text-muted-foreground/80 text-xs">
              AI-engineered setup infrastructure for teams that want reproducible context across
              modern coding tools.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 font-mono text-[11px] uppercase tracking-[0.18em]">
            <Link href="/#how" className="transition-colors hover:text-accent cursor-pointer">
              Workflow
            </Link>
            <Link href="/#catalog" className="transition-colors hover:text-accent cursor-pointer">
              Catalog
            </Link>
            <Link href="/#command" className="transition-colors hover:text-accent cursor-pointer">
              Install flow
            </Link>
            <Link
              href="/docs"
              className="transition-colors hover:text-accent font-semibold text-accent cursor-pointer"
            >
              Documentation
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/20 flex justify-center items-center select-none">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#bdc9c2]/60 flex items-center gap-1.5 justify-center text-center">
            Made with <span className="text-accent animate-pulse">♥</span> by{" "}
            <span className="text-foreground hover:text-accent transition-colors duration-200 cursor-default">
              Vibe Coding
            </span>{" "}
            for <span className="text-accent font-medium">Vibe Coders</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
