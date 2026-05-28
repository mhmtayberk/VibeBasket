import {
	BookOpen,
	Cpu,
	Server,
	Layers,
	Play,
	Power,
	ShieldAlert,
	TerminalSquare,
	ArrowRight,
	Info,
	AlertTriangle,
	KeyRound,
} from "lucide-react";
import Link from "next/link";
import { AuthMenu } from "@/components/auth/AuthMenu";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { DocSearchBar } from "@/components/docs/DocSearchBar";
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
		? (resolvedSearchParams.tab || "hub")
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
			keywords: "quick start install setup begin fast integration mcp catalog register workspace onboarding guide",
		},
		{
			title: "CLI Reference",
			description:
				"Complete reference for the `vibebasket apply` command: bundle IDs, the `--force` flag, `--project-root` path overrides, and `--yes` for non-interactive environments.",
			icon: <TerminalSquare className="h-5 w-5 text-[#33bbc5]" />,
			linkText: "View CLI reference",
			tabKey: "cli",
			keywords: "cli command terminal apply flags options parameters arguments run exec automation non-interactive overwrite",
		},
		{
			title: "IDE Adapters",
			description:
				"All 19 supported targets: Cursor, Windsurf, VS Code, Claude Code, Gemini CLI, Codex CLI, Zed, Junie, Kiro, DeepSeek-TUI, Continue, Roo Code, Hermes, OpenClaw, Cline CLI, Antigravity, GitHub Copilot, Void Editor, and Aider.",
			icon: <Power className="h-5 w-5 text-[#ff5722]" />,
			linkText: "Explore adapters",
			tabKey: "adapters",
			keywords: "ide adapters cursor windsurf vscode claude codex gemini zed kiro junie deepseek continue roocode hermes openclaw cline antigravity editors configuration files tools compatibility integration settings json yaml toml",
		},
		{
			title: "Block Delimiter Engine",
			description:
				"How VibeBasket writes idempotent rule and skill blocks into `.clinerules`, `.hermesrules`, and `.openclawrules` files without ever touching surrounding developer content.",
			icon: <Cpu className="h-5 w-5 text-[#ffb300]" />,
			linkText: "Read spec",
			tabKey: "delimiters",
			keywords: "delimiter block idempotent rules merge clinerules hermesrules openclawrules custom prompt instructions safe parsing updates append write files regex formatting marker marker-based engine",
		},
		{
			title: "Credentials & Security",
			description:
				"VibeBasket never stores API keys or tokens. All secrets are prompted and injected locally by the CLI. The cloud database holds only bundle metadata.",
			icon: <KeyRound className="h-5 w-5 text-[#e040fb]" />,
			linkText: "Security model",
			tabKey: "security",
			keywords: "security secrets api keys credentials zero trust prompt injection local storage sensitive tokens database metadata privacy protection data leakage encryption shielding shield",
		},
		{
			title: "Self-Hosting",
			description:
				"Deploy VibeBasket on your own infrastructure. Environment variables, SQLite WAL mode, OAuth provider gating, TRUST_PROXY for Cloudflare/Nginx, and the admin dashboard.",
			icon: <Server className="h-5 w-5 text-[#a0fdda]" />,
			linkText: "Self-hosting guide",
			tabKey: "self-hosting",
			keywords: "self hosting deploy production sqlite oauth admin docker dockerfile compose volumes ports deployment manual reverse proxy nginx cloudflare network concurrency database-url path environment variables",
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

						<div className="pb-6">
							<p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#bdc9c2]/50 mb-4 pl-6">
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
							v0.9 · 19 adapters
						</p>
					</div>
				</aside>
 
				{/* Main Content Area - Extremely Spacious (py-16, space-y-24) */}
				<main className="flex-1 px-12 sm:px-16 lg:px-24 pt-20 pb-36 max-w-5xl min-w-0">
					{/* Active tab content switcher */}
					{activeTab === "hub" && (
						<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
							{/* Breadcrumbs (Visual Spec Match) */}
							<div className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-12 flex items-center gap-2 select-none">
								<span className="opacity-80">Docs</span>
								<span className="text-[#bdc9c2]/30">/</span>
								<span className="text-foreground">Architectural Hub</span>
							</div>

							{/* Hero Title Block - Airy and Spaced */}
							<div className="mb-24">
								<span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#a0fdda] border border-[#a0fdda]/20 bg-[#a0fdda]/5 px-4 py-2 rounded-[2px] inline-block mb-8 select-none">
									VibeBasket Technical Specs
								</span>
								<h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
									Documentation Hub
								</h1>
								<p className="text-base sm:text-lg text-[#bdc9c2] max-w-3xl leading-relaxed">
									Everything you need to configure, run, and scale reproducible developer contexts. Explore our guides, command-line arguments, and local security configurations.
								</p>
							</div>

							{/* Bento Grid */}
							{guides.length === 0 ? (
								<div className="py-20 text-center">
									<p className="font-mono text-sm text-[#bdc9c2]/60">
										No results for &ldquo;<span className="text-[#a0fdda]">{searchQuery}</span>&rdquo;. Try a different keyword.
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-14 mb-44">
									{guides.map((guide) => (
										<Link
											key={guide.title}
											href={`/docs?tab=${guide.tabKey}`}
											className="group relative bg-[#181d1a] border border-[#3e4944] p-10 hover:border-[#a0fdda] hover:bg-[#202622] hover:shadow-[0_0_30px_rgba(160,253,218,0.18)] hover:-translate-y-1.5 active:scale-[0.97] transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer rounded-[2px]"
										>
											{/* Subtle visual gradient glow on hover */}
											<div className="absolute inset-0 bg-gradient-to-br from-[#a0fdda]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

											<div className="mb-8 w-12 h-12 rounded-[2px] border border-[#3e4944] bg-[#101412] flex items-center justify-center group-hover:border-[#a0fdda]/70 group-hover:bg-[#a0fdda]/10 transition-all shrink-0">
												{guide.icon}
											</div>
											<h3 className="text-base font-semibold text-foreground mb-4 group-hover:text-[#a0fdda] transition-colors">
												{guide.title}
											</h3>
											<p className="text-xs text-[#bdc9c2] leading-relaxed flex-1">
												{guide.description}
											</p>
											<div className="mt-8 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#a0fdda] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-6px] group-hover:translate-x-1.5">
												{guide.linkText}
												<ArrowRight className="h-3.5 w-3.5" />
											</div>
										</Link>
									))}
								</div>
							)}
						</div>
					)}

					{activeTab === "getting-started" && (
						<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
							{/* Breadcrumbs */}
							<div className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-12 flex items-center gap-2 select-none">
								<Link href="/docs" className="opacity-80 hover:text-[#a0fdda] transition-colors cursor-pointer">Docs</Link>
								<span className="text-[#bdc9c2]/30">/</span>
								<span className="text-foreground">Getting Started</span>
							</div>

							{/* Hero Title Block */}
							<div className="mb-24">
								<h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
									Getting Started
								</h1>
								<p className="text-base sm:text-lg text-[#bdc9c2] max-w-3xl leading-relaxed">
									Welcome to the VibeBasket ecosystem. This guide provides a rapid introduction to initializing your workspace, understanding the core architecture, and applying your first AI-engineered setup bundle.
								</p>
							</div>

							<div className="space-y-28 border-t border-[#3e4944]/50 pt-20">
								<section id="overview" className="scroll-mt-28">
									<h2 className="text-2xl font-semibold tracking-tight text-foreground mb-6">
										Core Methodology
									</h2>
									<p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl">
										VibeBasket functions as the Ninite for Vibe Coding. It solves the friction of manually configuring developer toolchains, local agent rules, and Model Context Protocol (MCP) servers across different AI-assisted IDEs. By selecting custom components inside the web catalog, you curate an anonymous, reproducible bundle that consolidates all settings under a single immutable hash.
									</p>
								</section>

								<section id="installation" className="scroll-mt-28">
									<div className="flex items-center gap-2.5 mb-8">
										<Play className="h-6 w-6 text-[#a0fdda] animate-pulse" />
										<h2 className="text-2xl font-semibold tracking-tight text-foreground">
											Installation
										</h2>
									</div>

									<div className="prose prose-invert max-w-none text-sm text-[#bdc9c2] leading-relaxed space-y-8">
										<p className="max-w-3xl">
											To inject this compiled developer context into your target codebase, copy the generated command and execute it inside your local project workspace:
										</p>

										{/* Terminal Code Block - Spacious (my-10) */}
										<div className="border border-[#3e4944] rounded-[2px] overflow-hidden bg-[#101412] shadow-xl group relative my-10">
											<div className="flex items-center justify-between px-6 py-4 border-b border-[#3e4944] bg-[#1c211e] select-none">
												<div className="flex items-center gap-2">
													<TerminalSquare className="h-4 w-4 text-[#a0fdda]" />
													<span className="font-mono text-[10px] uppercase tracking-wider text-[#bdc9c2]">
														terminal
													</span>
												</div>
												<span className="font-mono text-[9px] uppercase text-[#bdc9c2]/50 select-none">
													bash
												</span>
											</div>
											<div className="p-8 bg-[#0a0f0d] overflow-x-auto">
												<pre className="font-mono text-xs text-foreground leading-relaxed">
													<span className="text-[#a0fdda]">npx</span> vibebasket apply <span className="text-[#a0fdda]/85 font-semibold">cj2k9x</span>
												</pre>
											</div>
										</div>

										{/* Callout Information - Extra padding (p-8) */}
										<div className="flex gap-4 p-8 border-l-2 border-[#a0fdda] bg-[#a0fdda]/5 rounded-r-[2px] my-10">
											<Info className="h-5.5 w-5.5 text-[#a0fdda] shrink-0 mt-0.5" />
											<div>
												<h4 className="font-mono text-[11px] uppercase tracking-widest text-[#a0fdda] font-semibold mb-3">
													Global CLI Usage
												</h4>
												<p className="text-xs text-[#bdc9c2] leading-relaxed">
													The <code className="font-mono text-[11px] text-[#a0fdda] bg-[#a0fdda]/10 px-1.5 py-0.5 rounded-[2px] border border-[#a0fdda]/20">npx</code> command triggers an on-demand, lightweight sandbox runner to ensure you always execute the latest registry structure without global dependency bloat. Power users can globally register the client with <code className="font-mono text-[11px] text-[#a0fdda] bg-[#a0fdda]/10 px-1.5 py-0.5 rounded-[2px] border border-[#a0fdda]/20">npm i -g vibebasket</code> to enable the fast local <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">vb</code> alias directly.
												</p>
											</div>
										</div>
									</div>
								</section>
							</div>
						</div>
					)}

					{activeTab === "cli" && (
						<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
							{/* Breadcrumbs */}
							<div className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-12 flex items-center gap-2 select-none">
								<Link href="/docs" className="opacity-80 hover:text-[#a0fdda] transition-colors cursor-pointer">Docs</Link>
								<span className="text-[#bdc9c2]/30">/</span>
								<span className="text-foreground">CLI Reference</span>
							</div>

							<div className="mb-24">
								<h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
									CLI Reference
								</h1>
								<p className="text-base sm:text-lg text-[#bdc9c2] max-w-3xl leading-relaxed">
									Complete CLI command specifications, parameters, and flags for local terminal automation workflows.
								</p>
							</div>

							<div className="space-y-28 border-t border-[#3e4944]/50 pt-20">
								<section id="overview" className="scroll-mt-28">
									<div className="flex items-center gap-2.5 mb-8">
										<TerminalSquare className="h-6 w-6 text-[#33bbc5]" />
										<h2 className="text-2xl font-semibold tracking-tight text-foreground">
											Core Architecture
										</h2>
									</div>
									<p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl">
										The <code className="font-mono text-xs text-[#33bbc5] bg-[#33bbc5]/10 px-1.5 py-0.5 rounded-[2px] border border-[#33bbc5]/20">vibebasket</code> CLI works as an idempotent client script. When a bundle URL or ID is passed, it executes entirely in the local environment context, resolving necessary file merges, prompts, and server setups securely.
									</p>
								</section>

								<section id="commands" className="scroll-mt-28">
									<h2 className="text-2xl font-semibold tracking-tight text-foreground mb-8">
										Available Commands
									</h2>
									<div className="space-y-4">
										<div className="p-8 border border-[#3e4944] bg-[#181d1a] rounded-[2px] hover:border-[#a0fdda] hover:bg-[#202622] hover:shadow-[0_0_20px_rgba(160,253,218,0.15)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300">
											<code className="font-mono text-[#a0fdda] text-sm font-semibold block mb-2">vibebasket apply &lt;bundle-id&gt;</code>
											<p className="text-xs text-[#bdc9c2] leading-relaxed">
												The primary command. Fetches the bundle from the VibeBasket API, validates its manifest, and applies each item (MCP servers, skills, rules) to every compatible local adapter.
												Adapters back up existing config files before writing and merge entries idempotently — running apply twice is safe.
											</p>
										</div>
									</div>
									<div className="flex gap-4 p-6 border-l-2 border-[#33bbc5] bg-[#33bbc5]/5 rounded-r-[2px] mt-8">
										<TerminalSquare className="h-5 w-5 text-[#33bbc5] shrink-0 mt-0.5" />
										<div>
											<h4 className="font-mono text-[11px] uppercase tracking-widest text-[#33bbc5] font-semibold mb-2">
												Current scope
											</h4>
											<p className="text-xs text-[#bdc9c2] leading-relaxed">
												<code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">apply</code> is currently the only top-level CLI command.
												Additional commands such as <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">list</code> and <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">prune</code> are on the roadmap.
											</p>
										</div>
									</div>
								</section>

								<section id="flags" className="scroll-mt-28">
									<h2 className="text-2xl font-semibold tracking-tight text-[#dfe4df] mb-8">
										apply — Flags
									</h2>
									<div className="border border-[#3e4944] rounded-[2px] overflow-hidden my-10 shadow-sm">
										<table className="w-full border-collapse text-left text-xs leading-relaxed">
											<thead>
												<tr className="bg-[#1c211e] border-b border-[#3e4944] font-mono uppercase tracking-wider text-[10px] text-foreground">
													<th className="p-5 pl-7 font-semibold">Flag</th>
													<th className="p-5 font-semibold">Type</th>
													<th className="p-5 font-semibold pr-7">Description</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-[#3e4944] font-mono text-[#bdc9c2]">
												<tr className="hover:bg-[#1c211e]/40 transition-colors">
													<td className="p-5 pl-7 text-[#a0fdda] font-semibold">--force / -f</td>
													<td className="p-5">Boolean</td>
													<td className="p-5 pr-7 text-xs font-sans text-[#bdc9c2]/90 leading-relaxed">
														Overwrites existing config entries instead of merging. Useful when you want a clean slate on a target that already has some MCP servers configured.
													</td>
												</tr>
												<tr className="hover:bg-[#1c211e]/40 transition-colors">
													<td className="p-5 pl-7 text-[#a0fdda] font-semibold">--project-root / -p</td>
													<td className="p-5">String</td>
													<td className="p-5 pr-7 text-xs font-sans text-[#bdc9c2]/90 leading-relaxed">
														Sets the working directory where workspace-scoped config files (e.g. <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">.cursor/mcp.json</code>) are resolved. Defaults to <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">process.cwd()</code>.
													</td>
												</tr>
												<tr className="hover:bg-[#1c211e]/40 transition-colors">
													<td className="p-5 pl-7 text-[#a0fdda] font-semibold">--yes / -y</td>
													<td className="p-5">Boolean</td>
													<td className="p-5 pr-7 text-xs font-sans text-[#bdc9c2]/90 leading-relaxed">
														Skips all interactive confirmation prompts. Useful in CI pipelines or scripts where no user input is available.
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</section>
							</div>
						</div>
					)}

					{activeTab === "adapters" && (
						<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
							{/* Breadcrumbs */}
							<div className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-12 flex items-center gap-2 select-none">
								<Link href="/docs" className="opacity-80 hover:text-[#a0fdda] transition-colors cursor-pointer">Docs</Link>
								<span className="text-[#bdc9c2]/30">/</span>
								<span className="text-foreground">IDE Adapters</span>
							</div>

							<div className="mb-24">
								<h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
									IDE Adapters
								</h1>
								<p className="text-base sm:text-lg text-[#bdc9c2] max-w-3xl leading-relaxed">
									19 supported targets, each with its own adapter that reads the target&apos;s config format, merges entries idempotently, and backs up the original file before writing. MCP configuration is supported on every adapter. Skills and rules are additionally supported on Continue, Roo Code, Hermes, OpenClaw, GitHub Copilot, Void Editor, and Aider.
								</p>
							</div>

							<div className="space-y-28 border-t border-[#3e4944]/50 pt-20">
								{/* Capability legend */}
								<section className="scroll-mt-28">
									<div className="flex items-center gap-2.5 mb-8">
										<Power className="h-6 w-6 text-[#ff5722]" />
										<h2 className="text-2xl font-semibold tracking-tight text-foreground">All Supported Targets</h2>
									</div>
									<p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-10">
										Each adapter is a standalone module in <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">packages/adapters</code>. It resolves the target config path, merges the new MCP entries (and optionally skills/rules), and creates a timestamped backup of the original file before writing.
									</p>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
										{([
											{ name: "Cursor", color: "#ff5722", config: ".cursor/mcp.json or ~/.cursor/mcp.json", skills: false, note: "Workspace-scoped or user-scoped JSON. Both paths are checked; workspace takes precedence." },
											{ name: "Windsurf", color: "#33bbc5", config: "~/.codeium/windsurf/mcp_config.json", skills: false, note: "Global user-scoped MCP config. Entries are merged under the mcpServers key." },
											{ name: "VS Code / Cline", color: "#007ACC", config: "~/.vscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json", skills: false, note: "Targets the Cline extension's global MCP settings file." },
											{ name: "Claude Code", color: "#D4A574", config: "~/.claude.json", skills: false, note: "Anthropic's Claude Code CLI reads mcpServers from the root ~/.claude.json file." },
											{ name: "Gemini CLI", color: "#4285F4", config: "~/.gemini/settings.json", skills: false, note: "Google's Gemini CLI reads mcpServers from its settings.json file." },
											{ name: "Codex CLI", color: "#10A37F", config: "~/.codex/config.toml", skills: false, note: "OpenAI Codex CLI uses a TOML-formatted config. Single and double-quoted server identifiers are both handled." },
											{ name: "Antigravity", color: "#a0fdda", config: "~/.gemini/antigravity/mcp_config.json", skills: false, note: "Google Gemini's Antigravity agent reads MCP config from its own scoped path." },
											{ name: "Zed", color: "#084994", config: "~/.config/zed/settings.json (context_servers key)", skills: false, note: "Zed uses context servers instead of the MCP mcpServers convention. The adapter maps accordingly." },
											{ name: "JetBrains Junie", color: "#FF318C", config: "~/.junie/mcp.json", skills: false, note: "JetBrains Junie uses a dedicated ~/.junie directory for MCP server configuration." },
											{ name: "Kiro", color: "#5B4FE9", config: "~/.kiro/settings/mcp.json", skills: false, note: "Amazon's Kiro IDE stores MCP configuration in its settings directory." },
											{ name: "Cline CLI", color: "#5C6BC0", config: "~/.vscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json", skills: false, note: "Shares the same MCP settings path as VS Code / Cline but is applied from the terminal." },
											{ name: "DeepSeek-TUI", color: "#1C6EF2", config: "~/.deepseek/mcp.json", skills: false, note: "DeepSeek-TUI reads MCP configuration from its scoped home directory. Skills/rules auto-apply is not yet supported." },
											{ name: "Continue", color: "#00E5FF", config: "~/.continue/config.json + .continue/prompts/*.prompt", skills: true, note: "MCP servers merge into the config.json mcpServers array. Skills are written as .prompt files under .continue/prompts/." },
											{ name: "Roo Code", color: "#FF3D00", config: "roocode_mcp_settings.json + .clinerules", skills: true, note: "MCP entries merge into roocode_mcp_settings.json. Rules and skills are written into .clinerules using the VibeBasket block delimiter engine." },
											{ name: "Hermes", color: "#FFD600", config: "~/.hermes/config.yaml + .hermesrules", skills: true, note: "MCP servers merge into the YAML config. Rules and skills are written into .hermesrules using idempotent block delimiters." },
											{ name: "OpenClaw", color: "#E040FB", config: "~/.openclaw/openclaw.json + .openclawrules", skills: true, note: "MCP entries merge into the JSON config. Rules and skills are written into .openclawrules using idempotent block delimiters." },
											{ name: "GitHub Copilot", color: "#FF1744", config: ".github/copilot-instructions.md", skills: true, note: "Rules and skills are written as Markdown custom instructions inside .github/copilot-instructions.md." },
											{ name: "Void Editor", color: "#673AB7", config: "~/.config/void/mcp_servers.json + .voidrules", skills: true, note: "MCP servers merge into the mcp_servers.json. Rules and skills are written into .voidrules and .clinerules using idempotent block delimiters." },
											{ name: "Aider", color: "#4CAF50", config: ".aider.conf.yml + .aiderinstructions.md", skills: true, note: "Registers .aiderinstructions.md via the read flag in .aider.conf.yml. Rules and skills are written into the instructions Markdown file." },
										] as { name: string; color: string; config: string; skills: boolean; note: string }[]).map((adapter) => (
											<div
												key={adapter.name}
												className="p-7 border border-[#3e4944] bg-[#181d1a] rounded-[2px] hover:bg-[#202622] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 group"
												style={{ '--hover-color': adapter.color } as React.CSSProperties}
											>
												<div className="flex items-start justify-between mb-3">
													<h4 className="text-foreground font-semibold font-mono text-xs uppercase tracking-wide flex items-center gap-2">
														<span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: adapter.color }} />
														{adapter.name}
													</h4>
													{adapter.skills && (
														<span className="font-mono text-[8px] uppercase tracking-wider text-[#a0fdda] border border-[#a0fdda]/30 bg-[#a0fdda]/5 px-1.5 py-0.5 rounded-[2px] shrink-0">
															MCP + Skills
														</span>
													)}
												</div>
												<code className="font-mono text-[9px] text-[#bdc9c2]/70 bg-[#0a0f0d] border border-[#3e4944]/60 px-2 py-1 rounded-[2px] block mb-3 break-all">{adapter.config}</code>
												<p className="text-xs text-[#bdc9c2]/80 leading-relaxed">{adapter.note}</p>
											</div>
										))}
									</div>
								</section>
							</div>
						</div>
					)}

					{activeTab === "delimiters" && (
						<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
							{/* Breadcrumbs */}
							<div className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-12 flex items-center gap-2 select-none">
								<Link href="/docs" className="opacity-80 hover:text-[#a0fdda] transition-colors cursor-pointer">Docs</Link>
								<span className="text-[#bdc9c2]/30">/</span>
								<span className="text-foreground">Block Delimiters</span>
							</div>

							<div className="mb-24">
								<h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
									Block Delimiters
								</h1>
								<p className="text-base sm:text-lg text-[#bdc9c2] max-w-3xl leading-relaxed">
									Idempotent local file merging specifications with high-fidelity block-level delimiters.
								</p>
							</div>

							<div className="space-y-28 border-t border-[#3e4944]/50 pt-20">
								<section id="delimiters" className="scroll-mt-28">
									<div className="flex items-center gap-2.5 mb-8">
										<Cpu className="h-6 w-6 text-[#ffb300]" />
										<h2 className="text-2xl font-semibold tracking-tight text-foreground">
											Idempotent Safe Merging
										</h2>
									</div>

									<div className="prose prose-invert max-w-none text-sm text-[#bdc9c2] leading-relaxed space-y-8">
										<p className="max-w-3xl">
											When writing rulesets, instructions, or custom skill profiles into codebases (for files like <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">.clinerules</code> or <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">.hermesrules</code>), the CLI prevents code pollution by wrapping updates inside strict delimiters:
										</p>

										{/* Rules Format Code Block - Spacious (my-10) */}
										<div className="border border-[#3e4944] rounded-[2px] overflow-hidden bg-[#101412] shadow-xl group relative my-10">
											<div className="flex items-center justify-between px-6 py-4 border-b border-[#3e4944] bg-[#1c211e] select-none">
												<div className="flex items-center gap-2">
													<TerminalSquare className="h-4 w-4 text-[#a0fdda]" />
													<span className="font-mono text-[10px] uppercase tracking-wider text-[#bdc9c2]">
														rules format
													</span>
												</div>
												<span className="font-mono text-[9px] uppercase text-[#bdc9c2]/50 select-none">
													rules
												</span>
											</div>
											<div className="p-8 bg-[#0a0f0d] overflow-x-auto">
												<pre className="font-mono text-xs text-muted-foreground/75 leading-relaxed">
													<span className="text-amber-400">{"# >>> VIBEBASKET START: custom-skill-id <<<"}</span><br />
													{"# Skill: Custom Skill (custom-skill-id)"}<br />
													{"... custom developer prompts and instructions ..."}<br />
													<span className="text-amber-400">{"# >>> VIBEBASKET END: custom-skill-id <<<"}</span>
												</pre>
											</div>
										</div>

										<p className="max-w-3xl">
											This block model allows developers to easily apply updates. If the block boundary exists, VibeBasket executes a dynamic replacement. If missing, it appends it, leaving everything outside the delimiters untouched.
										</p>
									</div>
								</section>
							</div>
						</div>
					)}

					{activeTab === "security" && (
						<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
							{/* Breadcrumbs */}
							<div className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-12 flex items-center gap-2 select-none">
								<Link href="/docs" className="opacity-80 hover:text-[#a0fdda] transition-colors cursor-pointer">Docs</Link>
								<span className="text-[#bdc9c2]/30">/</span>
								<span className="text-foreground">Secret Security</span>
							</div>

							<div className="mb-24">
								<h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
									Secret Security
								</h1>
								<p className="text-base sm:text-lg text-[#bdc9c2] max-w-3xl leading-relaxed">
									Strict secure coding rules, zero-trust cloud storage models, and local secret shielding mechanisms.
								</p>
							</div>

							<div className="space-y-28 border-t border-[#3e4944]/50 pt-20">
								<section id="security-model" className="scroll-mt-28">
									<div className="flex items-center gap-2.5 mb-8">
										<KeyRound className="h-6 w-6 text-[#e040fb]" />
										<h2 className="text-2xl font-semibold tracking-tight text-foreground">
											Zero-Secret Policy
										</h2>
									</div>

									<div className="prose prose-invert max-w-none text-sm text-[#bdc9c2] leading-relaxed space-y-8">
										<p className="max-w-3xl">
											Security is the primary directive of VibeBasket. Sensitive keys (such as OpenAI or GitHub API tokens) never transit to or get cached inside our database cluster.
										</p>

										{/* Warning Callout - Spacious (my-10) */}
										<div className="flex gap-4 p-8 border-l-2 border-red-500 bg-red-500/5 rounded-r-[2px] my-10">
											<ShieldAlert className="h-5.5 w-5.5 text-red-500 shrink-0 mt-0.5" />
											<div>
												<h4 className="font-mono text-[11px] uppercase tracking-widest text-red-400 font-semibold mb-3">
													Zero-Trust Cloud Policy
												</h4>
												<p className="text-xs text-muted-foreground/90 leading-relaxed">
													VibeBasket never asks for, stores, or transmits API keys, user tokens, or passwords to our cloud servers. All bundle data stored in the database is strictly metadata describing the selected packages, configurations, and environment shapes.
												</p>
											</div>
										</div>

										<p className="max-w-3xl">
											Instead, when applying a bundle locally, the CLI parses target credential keys and safely prompts the user inside the local terminal scope to inject them securely.
										</p>
									</div>
								</section>

								<section id="rate-limiting" className="scroll-mt-28">
									<div className="flex items-center gap-2.5 mb-8">
										<ShieldAlert className="h-6 w-6 text-[#a0fdda]" />
										<h2 className="text-2xl font-semibold tracking-tight text-foreground">Rate Limiting</h2>
									</div>
									<div className="prose prose-invert max-w-none text-sm text-[#bdc9c2] leading-relaxed space-y-8">
										<p className="max-w-3xl">All public API endpoints are protected by a sliding-window rate limiter with per-IP tracking and automatic garbage collection.</p>
										<div className="overflow-x-auto">
											<table className="w-full border border-[#3e4944]">
												<thead className="bg-[#181d1a]"><tr className="text-left font-mono text-[10px] uppercase tracking-widest text-[#bdc9c2]"><th className="p-3 border-b border-[#3e4944] pl-4">Endpoint</th><th className="p-3 border-b border-[#3e4944]">Limit</th></tr></thead>
												<tbody className="divide-y divide-[#3e4944] font-mono text-[#bdc9c2]">
													{[["/api/health","120/min"],["/api/catalog","120/min"],["/api/auth/*","60/min"],["/api/bundle/[id]","60/min"],["/api/stacks","30/min"],["/api/admin/stats","30/min"],["/api/catalog/status","5/min"],["/api/bundle POST","20/min"]].map(([ep,lim]) => (<tr key={ep} className="hover:bg-[#1c211e]/40 transition-colors"><td className="p-3 pl-4 text-[#a0fdda]">{ep}</td><td className="p-3">{lim}</td></tr>))}
												</tbody>
											</table>
										</div>
									</div>
								</section>

								<section id="security-headers" className="scroll-mt-28">
									<div className="flex items-center gap-2.5 mb-8">
										<KeyRound className="h-6 w-6 text-[#e040fb]" />
										<h2 className="text-2xl font-semibold tracking-tight text-foreground">Security Headers</h2>
									</div>
									<div className="prose prose-invert max-w-none text-sm text-[#bdc9c2] leading-relaxed space-y-8">
										<p className="max-w-3xl">All API responses include hardened headers. In production, a Content-Security-Policy is also enforced.</p>
										<div className="overflow-x-auto">
											<table className="w-full border border-[#3e4944]">
												<thead className="bg-[#181d1a]"><tr className="text-left font-mono text-[10px] uppercase tracking-widest text-[#bdc9c2]"><th className="p-3 border-b border-[#3e4944] pl-4">Header</th><th className="p-3 border-b border-[#3e4944]">Value</th></tr></thead>
												<tbody className="divide-y divide-[#3e4944] font-mono text-[#bdc9c2]">
													{[["X-Frame-Options","DENY"],["X-Content-Type-Options","nosniff"],["Referrer-Policy","strict-origin-when-cross-origin"],["Permissions-Policy","camera=(), microphone=(), geolocation=()"],["Content-Security-Policy","default-src 'self'; frame-ancestors 'none'"]].map(([h,v]) => (<tr key={h} className="hover:bg-[#1c211e]/40 transition-colors"><td className="p-3 pl-4 text-[#a0fdda]">{h}</td><td className="p-3 text-[10px]">{v}</td></tr>))}
												</tbody>
											</table>
										</div>
									</div>
								</section>
							</div>
						</div>
					)}

					{activeTab === "self-hosting" && (
						<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
							{/* Breadcrumbs */}
							<div className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-12 flex items-center gap-2 select-none">
								<Link href="/docs" className="opacity-80 hover:text-[#a0fdda] transition-colors cursor-pointer">Docs</Link>
								<span className="text-[#bdc9c2]/30">/</span>
								<span className="text-foreground">Self-hosting</span>
							</div>

							<div className="mb-24">
								<h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
									Self-Hosting Guide
								</h1>
								<p className="text-base sm:text-lg text-[#bdc9c2] max-w-3xl leading-relaxed">
									Configure local database servers, secure API reverse proxies, and gate access roles.
								</p>
							</div>

							<div className="space-y-28 border-t border-[#3e4944]/50 pt-20">
								{/* Docker */}
								<section id="docker" className="scroll-mt-28">
									<div className="flex items-center gap-2.5 mb-8">
										<Server className="h-6 w-6 text-[#a0fdda]" />
										<h2 className="text-2xl font-semibold tracking-tight text-foreground">Docker (recommended)</h2>
									</div>
									<p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-8">
										The easiest way to self-host VibeBasket. The image is a lean multi-stage build based on Node.js 22 Alpine.
										The SQLite database file is persisted through a named Docker volume so your data survives container restarts and upgrades.
									</p>

									{/* Step 1 */}
									<div className="space-y-10">
										<div>
											<p className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-3">Step 1 — Clone &amp; configure</p>
											<pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`git clone https://github.com/your-org/vibebasket.git
cd vibebasket

# Copy the example env file and fill in your values
cp .env.example .env`}</pre>
										</div>

										{/* Step 2 */}
										<div>
											<p className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-3">Step 2 — Start with Docker Compose</p>
											<pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`docker compose up -d

# View logs
docker compose logs -f web`}</pre>
										</div>

										{/* Step 3 */}
										<div>
											<p className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-3">Step 3 — Seed the catalog</p>
											<pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`# Run the catalog sync inside the running container
docker compose exec web node scripts/catalog-sync.mjs`}</pre>
										</div>

										{/* Update */}
										<div>
											<p className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-3">Upgrading</p>
											<pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`git pull
docker compose up -d --build`}</pre>
										</div>
									</div>
								</section>

								{/* Manual installation */}
								<section id="manual" className="scroll-mt-28">
									<div className="flex items-center gap-2.5 mb-8">
										<TerminalSquare className="h-6 w-6 text-[#33bbc5]" />
										<h2 className="text-2xl font-semibold tracking-tight text-foreground">Manual Installation</h2>
									</div>
									<p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-8">
										Requires Node.js &ge;20 and pnpm &ge;9. Suitable for VMs, bare-metal servers, or platforms that don&apos;t run Docker.
									</p>
									<pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`git clone https://github.com/your-org/vibebasket.git && cd vibebasket
cp .env.example .env          # fill in values (see below)
pnpm install --frozen-lockfile
pnpm run build
node scripts/catalog-sync.mjs # seed the database
pnpm --filter web start        # production server on :3000`}</pre>
								</section>

								{/* Environment variables */}
								<section id="env-vars" className="scroll-mt-28">
									<div className="flex items-center gap-2.5 mb-8">
										<KeyRound className="h-6 w-6 text-[#e040fb]" />
										<h2 className="text-2xl font-semibold tracking-tight text-foreground">Environment Variables</h2>
									</div>

									{/* GitHub OAuth Callout */}
									<div className="flex gap-4 p-6 border-l-2 border-[#33bbc5] bg-[#33bbc5]/5 rounded-r-[2px] mb-8">
										<Info className="h-5.5 w-5.5 text-[#33bbc5] shrink-0 mt-0.5" />
										<div>
											<h4 className="font-mono text-[11px] uppercase tracking-widest text-[#33bbc5] font-semibold mb-3">
												GitHub OAuth Callback URL
											</h4>
											<p className="text-xs text-muted-foreground/90 leading-relaxed mb-3">
												When enabling GitHub authentication, you must configure the exact redirect callback URL in your GitHub Developer Application settings:
											</p>
											<pre className="bg-[#0a0f0d] p-4 border border-[#3e4944] font-mono text-[11px] text-[#a0fdda] overflow-x-auto rounded-[2px] leading-relaxed">
												{"${NEXTAUTH_URL}/api/auth/callback/github"}
											</pre>
											<p className="text-[10px] text-[#bdc9c2]/60 mt-3">
												For local development, this defaults to <code className="font-mono text-[10px] text-foreground bg-card px-1 py-0.5 rounded-[2px] border border-border/50">http://localhost:3000/api/auth/callback/github</code>.
											</p>
										</div>
									</div>

									<div className="flex gap-4 p-6 border-l-2 border-amber-400 bg-amber-400/5 rounded-r-[2px] mb-8">

										<AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
										<p className="text-xs text-[#bdc9c2] leading-relaxed">
											Never commit your <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">.env</code> file.
											The <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">.env</code> file is already listed in <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">.gitignore</code>.
											In Docker deployments, pass secrets as environment variables or use Docker secrets.
										</p>
									</div>

									<div className="border border-[#3e4944] rounded-[2px] overflow-hidden">
										<table className="w-full border-collapse text-left text-xs leading-relaxed">
											<thead>
												<tr className="bg-[#1c211e] border-b border-[#3e4944] font-mono uppercase tracking-wider text-[10px] text-foreground">
													<th className="p-4 pl-6 font-semibold">Variable</th>
													<th className="p-4 font-semibold">Required</th>
													<th className="p-4 pr-6 font-semibold">Description</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-[#3e4944] font-mono text-[#bdc9c2]">
												{[
													{ name: "DATABASE_URL", req: true, desc: 'SQLite connection string. Use file:/data/vibebasket.db for Docker (volume mount) or an absolute path for manual installs.' },
													{ name: "AUTH_SECRET", req: true, desc: 'Random 32-byte secret used to sign Next-Auth session tokens. Generate with: openssl rand -base64 32' },
													{ name: "NEXTAUTH_URL", req: true, desc: 'The public canonical URL of your deployment, e.g. https://vibebasket.example.com. Required for OAuth redirects.' },
													{ name: "AUTH_TRUST_HOST", req: false, desc: 'Set to true when running behind a reverse proxy. Required for OAuth callbacks to work correctly in production.' },
													{ name: "AUTH_GITHUB_ID / SECRET", req: false, desc: 'GitHub OAuth App credentials. Set AUTH_GITHUB_ENABLED=true to enable.' },
													{ name: "AUTH_GOOGLE_ID / SECRET", req: false, desc: 'Google OAuth credentials. Set AUTH_GOOGLE_ENABLED=true to enable.' },
													{ name: "AUTH_APPLE_ID / SECRET", req: false, desc: 'Apple Sign-In credentials. Set AUTH_APPLE_ENABLED=true to enable.' },
													{ name: "AUTH_MICROSOFT_ENTRA_ID_ID / SECRET", req: false, desc: 'Microsoft Entra ID (Azure AD) credentials. Set AUTH_MICROSOFT_ENTRA_ID_ENABLED=true. Uses /common/ endpoint by default.' },
													{ name: "ADMIN_OAUTH_EMAILS", req: false, desc: 'Comma-separated list of verified account emails that can access the /admin dashboard.' },
													{ name: "TRUST_PROXY", req: false, desc: 'Set to true when running behind Cloudflare, Nginx, or any reverse proxy. Enables correct IP extraction for rate limiting.' },
													{ name: "BACKUP_STORAGE_BACKEND", req: false, desc: 'Backup storage backend: local, s3, r2, spaces, azure, or gcs. Defaults to local. Can also be set via admin panel.' },
													{ name: "BACKUP_S3_* / R2_* / SPACES_*", req: false, desc: 'S3-compatible storage credentials (endpoint, region, bucket, access key, secret key). Covers AWS S3, Cloudflare R2, and DigitalOcean Spaces.' },
													{ name: "BACKUP_AZURE_CONNECTION_STRING / CONTAINER", req: false, desc: 'Azure Blob Storage connection string and container name.' },
													{ name: "BACKUP_GCS_BUCKET / PROJECT_ID", req: false, desc: 'Google Cloud Storage bucket name and GCP project ID.' },
												].map((v) => (
													<tr key={v.name} className="hover:bg-[#1c211e]/40 transition-colors">
														<td className="p-4 pl-6 text-[#a0fdda] font-semibold text-[10px]">{v.name}</td>
														<td className="p-4 text-[10px]">
															{v.req
																? <span className="text-red-400">Required</span>
																: <span className="text-[#bdc9c2]/50">Optional</span>}
														</td>
														<td className="p-4 pr-6 font-sans text-[#bdc9c2]/80 leading-relaxed">{v.desc}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</section>

								{/* WAL note */}
								<section id="concurrency" className="scroll-mt-28">
									<div className="flex gap-4 p-8 border-l-2 border-amber-400 bg-amber-400/5 rounded-r-[2px]">
										<AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
										<div>
											<h4 className="font-mono text-[11px] uppercase tracking-widest text-amber-400 font-semibold mb-3">SQLite WAL Mode</h4>
											<p className="text-xs text-muted-foreground/90 leading-relaxed">
												VibeBasket enables SQLite WAL (Write-Ahead Logging) mode on startup. This allows concurrent reads during writes and is required for the catalog sync process.
												Do <strong className="text-foreground">not</strong> mount the database file on a network filesystem (NFS, CIFS) — WAL locking relies on local OS primitives.
												If you run multiple Node.js replicas, use a load balancer that routes all writes to a single instance, or migrate to a Turso remote database.
											</p>
										</div>
									</div>
								</section>
							</div>
						</div>
					)}
				</main>
			</div>

			{/* Footer Block - 100% Identical to homepage centered footer menu */}
			<footer className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12 py-10 border-t border-[#3e4944]/50 mt-20">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="text-2xl font-bold text-foreground tracking-tighter">VibeBasket</p>
						<p className="mt-3 max-w-xl leading-7 text-muted-foreground/80 text-xs">
							AI-engineered setup infrastructure for teams that want reproducible
							context across modern coding tools.
						</p>
					</div>

					<div className="flex flex-wrap gap-5 font-mono text-[11px] uppercase tracking-[0.18em]">
						<Link
							href="/#how"
							className="transition-colors hover:text-accent cursor-pointer"
						>
							Workflow
						</Link>
						<Link
							href="/#catalog"
							className="transition-colors hover:text-accent cursor-pointer"
						>
							Catalog
						</Link>
						<Link
							href="/#command"
							className="transition-colors hover:text-accent cursor-pointer"
						>
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
						Made with <span className="text-accent animate-pulse">♥</span> by <span className="text-foreground hover:text-accent transition-colors duration-200 cursor-default">Vibe Coding</span> for <span className="text-accent font-medium">Vibe Coders</span>
					</p>
				</div>
			</footer>
		</div>
	);
}
