import { BookOpen, Layers, Play, TerminalSquare, KeyRound } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { AuthMenu } from "@/components/auth/AuthMenu";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { DocSearchBar } from "@/components/docs/DocSearchBar";
import { MobileTabSelector } from "@/components/docs/MobileTabSelector";
import { DocsTabAdapters } from "./tabs/DocsTabAdapters";
import { DocsTabCli } from "./tabs/DocsTabCli";
import { DocsTabDelimiters } from "./tabs/DocsTabDelimiters";
import { DocsTabGettingStarted } from "./tabs/DocsTabGettingStarted";
import { DocsTabHub } from "./tabs/DocsTabHub";
import { DocsTabSecurity } from "./tabs/DocsTabSecurity";
import { DocsTabSelfHosting } from "./tabs/DocsTabSelfHosting";
import { auth, getEnabledAuthProviders } from "@/auth";

interface SearchParams {
	tab?: string;
	q?: string;
}

const TAB_META: Record<string, { title: string; description: string }> = {
	hub: {
		title: "VibeBasket Documentation — AI Dev Setup Infrastructure",
		description: "Guides for the VibeBasket catalog, CLI, IDE adapters, block delimiters, security model, and self-hosting deployment.",
	},
	"getting-started": {
		title: "Getting Started — VibeBasket Docs",
		description: "Install your first AI context bundle in under 2 minutes. Browse the catalog, pick MCPs and skills, generate a bundle URL, and apply it with the CLI.",
	},
	cli: {
		title: "CLI Reference — VibeBasket Docs",
		description: "Complete reference for vibebasket apply, list, search, doctor, init, and rollback commands. Flags, scopes, dry-run, and environment variables.",
	},
	adapters: {
		title: "IDE Adapters — 24 Targets — VibeBasket Docs",
		description: "Multi-IDE adapter reference covering Cursor, Windsurf, VS Code, Claude Code, GitHub Copilot, and 19 more. Config paths, MCP/skills/rules support per target.",
	},
	delimiters: {
		title: "Block Delimiters — VibeBasket Docs",
		description: "How VibeBasket uses comment-block delimiters for idempotent file merging across shell scripts, markdown, and YAML config files.",
	},
	security: {
		title: "Security — Zero-Trust Model — VibeBasket Docs",
		description: "Zero-secret policy, rate limiting, security headers, CSP enforcement, and local credential prompting for the VibeBasket platform.",
	},
	"self-hosting": {
		title: "Self-Hosting Guide — VibeBasket Docs",
		description: "Deploy VibeBasket on your own infrastructure with Docker, manual Node.js setup, or Kubernetes via Helm. Environment variables, backup storage, and upgrade procedures.",
	},
};

export async function generateMetadata({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
	const { tab } = await searchParams;
	const meta = TAB_META[tab ?? ""] ?? TAB_META.hub;
	return {
		title: meta.title,
		description: meta.description,
		openGraph: {
			title: meta.title,
			description: meta.description,
		},
	};
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

	const searchQuery = resolvedSearchParams.q?.slice(0, 100).toLowerCase().trim() ?? "";

	const guides = [
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
				"Complete reference for the vibebasket apply command: bundle URLs, the --force flag, --scope overrides, and --dry-run preview mode.",
			icon: <TerminalSquare className="h-5 w-5 text-[#33bbc5]" />,
			linkText: "View CLI reference",
			tabKey: "cli",
			keywords:
				"cli terminal command apply install dry-run force scope deploy reference documentation configuration",
		},
		{
			title: "IDE Adapters",
			description:
				"Every supported IDE target, its config paths, MCP/skills/rules capability matrix, and adapter implementation notes.",
			icon: <Layers className="h-5 w-5 text-[#e040fb]" />,
			linkText: "Browse adapters",
			tabKey: "adapters",
			keywords: "ide adapter editor ide cursor windsurf vscode config path target compatibility",
		},
		{
			title: "Block Delimiters",
			description:
				"How VibeBasket uses comment-block delimiters for idempotent file merging across shell scripts, markdown, and YAML.",
			icon: <BookOpen className="h-5 w-5 text-[#ffb74d]" />,
			linkText: "Learn delimiters",
			tabKey: "delimiters",
			keywords: "delimiter block comment idempotent merge shell markdown yaml config safe write",
		},
		{
			title: "Secret Security",
			description:
				"Zero-secret cloud policy, local credential prompting, rate limiting architecture, and hardened HTTP security headers.",
			icon: <KeyRound className="h-5 w-5 text-[#e040fb]" />,
			linkText: "Review security",
			tabKey: "security",
			keywords: "security secret zero-trust rate limit header csp csrf api protection credential",
		},
		{
			title: "Self-Hosting Guide",
			description:
				"Run VibeBasket on your own infrastructure with Docker, plain Node.js, or Kubernetes. Backup storage, OAuth, and upgrade procedures.",
			icon: <TerminalSquare className="h-5 w-5 text-[#33bbc5]" />,
			linkText: "Self-host now",
			tabKey: "self-hosting",
			keywords:
				"self-host docker kubernetes helm deploy nodejs server infrastructure backup s3 r2",
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

	const isLinkActive = (tabName: string) => activeTab === tabName;

	return (
		<div className="min-h-screen bg-background text-foreground antialiased">
			<header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
				<div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-8">
						<Link
							href="/"
							className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
						>
							VibeBasket
						</Link>

						<nav className="hidden items-center gap-3 lg:flex">
							<Link
								href="/#who"
								className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
							>
								Who it&apos;s for
							</Link>
							<span className="text-border/60 select-none">|</span>
							<Link
								href="/#how"
								className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
							>
								How it works
							</Link>
							<span className="text-border/60 select-none">|</span>
							<Link
								href="/#catalog"
								className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
							>
								Catalog
							</Link>
							<span className="text-border/60 select-none">|</span>
							<Link
								href="/#command"
								className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
							>
								Install flow
							</Link>
							<span className="text-border/60 select-none">|</span>
							<Link
								href="/docs"
								className={`font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:text-accent ${
									activeTab === "hub" ? "text-accent font-semibold" : "text-muted-foreground"
								}`}
							>
								Docs
							</Link>
						</nav>
					</div>

					<div className="flex items-center gap-3">
						<DocSearchBar initialQuery={searchQuery} />

						{session?.user ? (
							<AuthMenu session={session} />
						) : (
							<SignInDialog
								providers={enabledProviders}
								callbackUrl="/docs"
								triggerLabel="Login"
								triggerClassName="inline-flex items-center gap-2 border border-border/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
							/>
						)}

						<Link
							href="/#catalog"
							className="hidden sm:inline-flex items-center gap-2 border border-accent bg-accent/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							Build your basket
						</Link>
					</div>
				</div>
			</header>

			<div className="mx-auto flex max-w-[1440px] px-0 gap-0 pt-0 min-h-[calc(100vh-73px)] relative">
				<aside className="hidden lg:flex w-72 shrink-0 border-r border-border/80 bg-card/60 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto custom-scrollbar flex-col justify-between select-none">
					<div>
						<div className="p-6 border-b border-border/70">
							<div className="flex items-center gap-4 mb-3">
								<div className="w-10 h-10 rounded-[2px] bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
									<Layers className="h-5 w-5 text-accent" />
								</div>
								<div className="overflow-hidden">
									<div className="font-mono text-xs font-semibold text-foreground tracking-wider uppercase">
										Setup Builder
									</div>
									<div className="font-mono text-[10px] text-muted-foreground/60 truncate tracking-wider mt-0.5">
										0 items selected
									</div>
								</div>
							</div>
						</div>

						<div className="py-5">
							<p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50 mb-4 ml-6">
								Core Concepts
							</p>
							<nav className="space-y-1 font-mono text-[11px] uppercase tracking-wider">
								<Link
									href="/docs?tab=getting-started"
									className={`block px-6 py-3.5 transition-all duration-300 cursor-pointer border-l-2 hover:bg-card/40 hover:text-accent hover:pl-7 ${
										isLinkActive("getting-started")
											? "border-accent text-accent bg-accent/10 font-semibold pl-7"
											: "border-transparent text-muted-foreground"
									}`}
								>
									Getting Started
								</Link>
								<Link
									href="/docs?tab=cli"
									className={`block px-6 py-3.5 transition-all duration-300 cursor-pointer border-l-2 hover:bg-card/40 hover:text-accent hover:pl-7 ${
										isLinkActive("cli")
											? "border-accent text-accent bg-accent/10 font-semibold pl-7"
											: "border-transparent text-muted-foreground"
									}`}
								>
									CLI Reference
								</Link>
								<Link
									href="/docs?tab=adapters"
									className={`block px-6 py-3.5 transition-all duration-300 cursor-pointer border-l-2 hover:bg-card/40 hover:text-accent hover:pl-7 ${
										isLinkActive("adapters")
											? "border-accent text-accent bg-accent/10 font-semibold pl-7"
											: "border-transparent text-muted-foreground"
									}`}
								>
									IDE Adapters
								</Link>
								<Link
									href="/docs?tab=delimiters"
									className={`block px-6 py-3.5 transition-all duration-300 cursor-pointer border-l-2 hover:bg-card/40 hover:text-accent hover:pl-7 ${
										isLinkActive("delimiters")
											? "border-accent text-accent bg-accent/10 font-semibold pl-7"
											: "border-transparent text-muted-foreground"
									}`}
								>
									Block Delimiters
								</Link>
								<Link
									href="/docs?tab=security"
									className={`block px-6 py-3.5 transition-all duration-300 cursor-pointer border-l-2 hover:bg-card/40 hover:text-accent hover:pl-7 ${
										isLinkActive("security")
											? "border-accent text-accent bg-accent/10 font-semibold pl-7"
											: "border-transparent text-muted-foreground"
									}`}
								>
									Secret Security
								</Link>
								<Link
									href="/docs?tab=self-hosting"
									className={`block px-6 py-3.5 transition-all duration-300 cursor-pointer border-l-2 hover:bg-card/40 hover:text-accent hover:pl-7 ${
										isLinkActive("self-hosting")
											? "border-accent text-accent bg-accent/10 font-semibold pl-7"
											: "border-transparent text-muted-foreground"
									}`}
								>
									Self-hosting Guide
								</Link>
							</nav>
						</div>
					</div>

					<div className="border-t border-border/70 p-4">
						<p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/35 mb-2 pl-2">
							v0.9 · 24 adapters
						</p>
					</div>
				</aside>

				{/* Mobile tab selector */}
				<MobileTabSelector activeTab={activeTab} />

				<main className="flex-1 px-4 sm:px-12 lg:px-24 pt-14 pb-36 max-w-5xl min-w-0">
					{activeTab === "hub" && <DocsTabHub searchQuery={searchQuery} guides={filteredGuides} />}
					{activeTab === "getting-started" && <DocsTabGettingStarted />}
					{activeTab === "cli" && <DocsTabCli />}
					{activeTab === "adapters" && <DocsTabAdapters />}
					{activeTab === "delimiters" && <DocsTabDelimiters />}
					{activeTab === "security" && <DocsTabSecurity />}
					{activeTab === "self-hosting" && <DocsTabSelfHosting />}
				</main>
			</div>

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
						<Link href="/#who" className="transition-colors hover:text-accent">
							Who it&apos;s for
						</Link>
						<span className="text-border/60 select-none">|</span>
						<Link href="/#how" className="transition-colors hover:text-accent">
							Workflow
						</Link>
						<span className="text-border/60 select-none">|</span>
						<Link href="/#catalog" className="transition-colors hover:text-accent">
							Catalog
						</Link>
						<span className="text-border/60 select-none">|</span>
						<Link href="/#command" className="transition-colors hover:text-accent">
							Install flow
						</Link>
						<span className="text-border/60 select-none">|</span>
						<Link href="/docs" className="transition-colors hover:text-accent font-semibold text-accent">
							Docs
						</Link>
					</div>
				</div>

				<div className="mt-8 pt-8 border-t border-border/20 flex justify-center items-center select-none">
					<p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5 justify-center text-center">
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
