import {
	BookOpen,
	Cpu,
	Server,
	HelpCircle,
	KeyRound,
	Layers,
	Play,
	Power,
	ShieldAlert,
	TerminalSquare,
	ArrowRight,
	Settings,
	Search,
	Star,
	Info,
	AlertTriangle,
	ShieldCheck,
	Activity,
} from "lucide-react";
import Link from "next/link";
import { AuthMenu } from "@/components/auth/AuthMenu";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { auth, getEnabledAuthProviders } from "@/auth";

export const metadata = {
	title: "VibeBasket Documentation | AI-Engineered Infrastructure",
	description:
		"Deep architectural guides, CLI command specifications, multi-IDE adapters, block delimiter engines, and self-hosting procedures.",
};

interface SearchParams {
	tab?: string;
}

export default async function DocsPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const session = await auth();
	const enabledProviders = getEnabledAuthProviders();
	const resolvedSearchParams = await searchParams;
	const activeTab = resolvedSearchParams.tab || "hub";

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

	const guides = [
		{
			title: "Quick Start Guide",
			description:
				"Initialize your first developer context bundle. Learn how to browse the catalog, select MCP servers, and generate shareable config URLs under 2 minutes.",
			icon: <Play className="h-5 w-5 text-[#a0fdda] animate-pulse" />,
			linkText: "Read quickstart",
			tabKey: "getting-started",
			gradient: "from-[#a0fdda]/10",
		},
		{
			title: "CLI Command Reference",
			description:
				"Detailed specifications for the `vibebasket` commander utility. Complete guide for `apply` command arguments, silent `--force` overrides, and project scope paths.",
			icon: <TerminalSquare className="h-5 w-5 text-[#33bbc5]" />,
			linkText: "View CLI commands",
			tabKey: "cli",
			gradient: "from-[#33bbc5]/10",
		},
		{
			title: "Multi-IDE Adapters",
			description:
				"Deep dive into our dynamic adapters. Learn how VibeBasket maps standard configurations into Cursor, Windsurf, VS Code, DeepSeek TUI, Hermes, and OpenClaw.",
			icon: <Power className="h-5 w-5 text-[#ff5722]" />,
			linkText: "Explore adapters",
			tabKey: "adapters",
			gradient: "from-[#ff5722]/10",
		},
		{
			title: "Rules & Merging Delimiters",
			description:
				"Learn about our unique block-level delimiter engine. Safe, idempotent prompt writes inside `.clinerules`, `.hermesrules`, and `.openclawrules` files without code collisions.",
			icon: <Cpu className="h-5 w-5 text-[#ffb300]" />,
			linkText: "Read merging spec",
			tabKey: "delimiters",
			gradient: "from-[#ffb300]/10",
		},
		{
			title: "Credentials Security",
			description:
				"How we handle secrets. Learn why VibeBasket never stores API tokens in the cloud database, prompting and injecting required credentials strictly in local terminal scope.",
			icon: <KeyRound className="h-5 w-5 text-[#e040fb]" />,
			linkText: "Review security policies",
			tabKey: "security",
			gradient: "from-[#e040fb]/10",
		},
		{
			title: "Self-Hosting Manual",
			description:
				"Deploy VibeBasket on your own infrastructure. Detailed instructions for configuring SQLite local storage, verified OAuth callback providers, and trust proxy settings.",
			icon: <Server className="h-5 w-5 text-[#a0fdda]" />,
			linkText: "Deploy self-hosted",
			tabKey: "self-hosting",
			gradient: "from-emerald-400/10",
		},
	];

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

					<div className="flex items-center gap-6">
						{/* Search Input Widget (Visual Spec Match) */}
						<div className="hidden md:flex items-center border border-[#3e4944] rounded-[2px] bg-[#181d1a]/50 focus-within:border-[#a0fdda] focus-within:ring-1 focus-within:ring-[#a0fdda]/25 transition-all px-4 py-2 w-72 select-none cursor-text">
							<Search className="h-4.5 w-4.5 text-[#bdc9c2] mr-2" />
							<input
								type="text"
								placeholder="Search documentation..."
								className="bg-transparent border-none p-0 text-xs font-mono focus:ring-0 text-foreground placeholder:text-[#bdc9c2]/50 w-full focus:outline-none"
								readOnly
							/>
							<span className="font-mono text-[9px] text-[#bdc9c2]/60 border border-[#3e4944] rounded-[2px] bg-[#1c211e] px-1 py-0.5 ml-2">
								⌘K
							</span>
						</div>

						<div className="flex items-center gap-4">
							<a
								href="https://github.com"
								target="_blank"
								rel="noopener noreferrer"
								className="hidden sm:flex items-center gap-2 border border-[#3e4944] bg-[#181d1a] px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-[#bdc9c2] hover:border-[#a0fdda] hover:text-[#a0fdda] hover:bg-[#262b28] transition-all cursor-pointer rounded-[2px]"
							>
								<Star className="h-3.5 w-3.5 text-[#a0fdda]" />
								GitHub Star
							</a>

							{/* Trailing Icons (Visual Spec Match) */}
							<div className="hidden sm:flex items-center gap-3 border-l border-[#3e4944] pl-4 select-none">
								<button className="text-[#bdc9c2] hover:text-[#a0fdda] transition-colors flex items-center justify-center p-1 cursor-pointer">
									<TerminalSquare className="h-4.5 w-4.5" />
								</button>
								<button className="text-[#bdc9c2] hover:text-[#a0fdda] transition-colors flex items-center justify-center p-1 cursor-pointer">
									<Settings className="h-4.5 w-4.5" />
								</button>
							</div>

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
							<Link
								href="/"
								className="block w-full text-center bg-[#a0fdda]/10 hover:bg-[#a0fdda] hover:text-[#002117] border border-[#a0fdda]/30 hover:border-[#a0fdda] hover:shadow-[0_0_15px_rgba(160,253,218,0.25)] text-[#a0fdda] font-mono text-[10px] uppercase tracking-widest py-3 px-4 rounded-[2px] transition-all duration-300 cursor-pointer active:scale-[0.97] font-semibold mt-5"
							>
								Generate Bundle
							</Link>
						</div>

						<div className="py-8">
							<p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#bdc9c2]/50 mb-4 pl-6">
								Navigation
							</p>
							<nav className="space-y-1">
								{sidebarNav.map((item) => (
									<Link
										key={item.title}
										href={item.href}
										className={`flex items-center gap-3.5 px-6 py-3.5 font-mono text-[11px] uppercase tracking-wider transition-all duration-300 cursor-pointer hover:bg-[#262b28]/60 hover:text-[#a0fdda] hover:pl-7 ${
											item.active && activeTab === "hub"
												? "bg-[#a0fdda]/10 border-l-2 border-[#a0fdda] text-[#a0fdda] font-semibold pl-7"
												: "text-[#bdc9c2]"
										}`}
									>
										{item.icon}
										{item.title}
									</Link>
								))}
							</nav>
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
 
					{/* Sidebar Footer Mappings (Visual Spec Match) */}
					<div className="border-t border-[#3e4944]/60 p-6">
						<nav className="space-y-1 font-mono text-[11px] uppercase tracking-wider">
							<Link
								href="/"
								className="flex items-center gap-3.5 text-[#bdc9c2] hover:text-[#a0fdda] py-3.5 px-6 transition-all duration-300 cursor-pointer hover:bg-[#262b28]/60 hover:pl-7"
							>
								<KeyRound className="h-4.5 w-4.5" />
								API Keys
							</Link>
							<Link
								href="/docs"
								className="flex items-center gap-3.5 text-[#bdc9c2] hover:text-[#a0fdda] py-3.5 px-6 transition-all duration-300 cursor-pointer hover:bg-[#262b28]/60 hover:pl-7"
							>
								<TerminalSquare className="h-4.5 w-4.5" />
								CLI Logs
							</Link>
						</nav>
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

							{/* Bento Grid - Comfortably Spaced (gap-12 to 14) with High-Polish Hover Lighting */}
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
									<div className="space-y-8">
										<div className="p-8 border border-[#3e4944] bg-[#181d1a] rounded-[2px] hover:border-[#a0fdda] hover:bg-[#202622] hover:shadow-[0_0_20px_rgba(160,253,218,0.15)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 cursor-pointer">
											<code className="font-mono text-[#a0fdda] text-sm font-semibold block mb-3">apply [bundle-id]</code>
											<p className="text-xs text-[#bdc9c2] leading-relaxed">
												Fetches, validates, and installs the target bundle config onto all compatible adapters.
											</p>
										</div>
										<div className="p-8 border border-[#3e4944] bg-[#181d1a] rounded-[2px] hover:border-[#a0fdda] hover:bg-[#202622] hover:shadow-[0_0_20px_rgba(160,253,218,0.15)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 cursor-pointer">
											<code className="font-mono text-[#a0fdda] text-sm font-semibold block mb-3">list</code>
											<p className="text-xs text-[#bdc9c2] leading-relaxed">
												Lists all active MCP servers and custom prompt rules loaded in the current directory scope.
											</p>
										</div>
										<div className="p-8 border border-[#3e4944] bg-[#181d1a] rounded-[2px] hover:border-[#a0fdda] hover:bg-[#202622] hover:shadow-[0_0_20px_rgba(160,253,218,0.15)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 cursor-pointer">
											<code className="font-mono text-[#a0fdda] text-sm font-semibold block mb-3">prune</code>
											<p className="text-xs text-[#bdc9c2] leading-relaxed">
												Safely removes all configurations injected by VibeBasket, restoring files to their pre-apply states.
											</p>
										</div>
									</div>
								</section>

								<section id="flags" className="scroll-mt-28">
									<h2 className="text-2xl font-semibold tracking-tight text-[#dfe4df] mb-8">
										Parameter Flags
									</h2>
									{/* Parameter Tables */}
									<div className="border border-[#3e4944] rounded-[2px] overflow-hidden my-10 shadow-sm">
										<table className="w-full border-collapse text-left text-xs leading-relaxed">
											<thead>
												<tr className="bg-[#1c211e] border-b border-[#3e4944] font-mono uppercase tracking-wider text-[10px] text-foreground">
													<th className="p-5 pl-7 font-semibold">Flag / Argument</th>
													<th className="p-5 font-semibold">Type</th>
													<th className="p-5 font-semibold pr-7">Description</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-[#3e4944] font-mono text-[#bdc9c2]">
												<tr className="hover:bg-[#1c211e]/40 transition-colors">
													<td className="p-5 pl-7 text-[#a0fdda] font-semibold">--force / -f</td>
													<td className="p-5">Boolean</td>
													<td className="p-5 pr-7 text-xs font-sans text-[#bdc9c2]/90 leading-relaxed">
														Forcefully overwrites target files or configuration keys instead of merging properties safely. Recommended during initial setups.
													</td>
												</tr>
												<tr className="hover:bg-[#1c211e]/40 transition-colors">
													<td className="p-5 pl-7 text-[#a0fdda] font-semibold">--project-root / -p</td>
													<td className="p-5">String</td>
													<td className="p-5 pr-7 text-xs font-sans text-[#bdc9c2]/90 leading-relaxed">
														Specifies the working directory path where your local IDE configuration files exist. Defaults to your current shell location (<code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">process.cwd()</code>).
													</td>
												</tr>
												<tr className="hover:bg-[#1c211e]/40 transition-colors">
													<td className="p-5 pl-7 text-[#a0fdda] font-semibold">--secret &lt;key&gt;=&lt;val&gt;</td>
													<td className="p-5">String</td>
													<td className="p-5 pr-7 text-xs font-sans text-[#bdc9c2]/90 leading-relaxed">
														Allows developers to seed required credentials directly into the execution context inline. Indispensable for headless automation, Docker setups, or CI pipelines.
													</td>
												</tr>
												<tr className="hover:bg-[#1c211e]/40 transition-colors">
													<td className="p-5 pl-7 text-[#a0fdda] font-semibold">--yes / -y</td>
													<td className="p-5">Boolean</td>
													<td className="p-5 pr-7 text-xs font-sans text-[#bdc9c2]/90 leading-relaxed">
														Automatically agrees to all environment configurations, skipping interactive prompt confirmations during apply operations.
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
								<span className="text-foreground">Multi-IDE Adapters</span>
							</div>

							<div className="mb-24">
								<h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
									IDE Adapters
								</h1>
								<p className="text-base sm:text-lg text-[#bdc9c2] max-w-3xl leading-relaxed">
									Deep architectural insights into how VibeBasket interfaces with multiple AI-assisted developer IDEs dynamically.
								</p>
							</div>

							<div className="space-y-28 border-t border-[#3e4944]/50 pt-20">
								<section id="architecture" className="scroll-mt-28">
									<div className="flex items-center gap-2.5 mb-8">
										<Power className="h-6 w-6 text-[#ff5722]" />
										<h2 className="text-2xl font-semibold tracking-tight text-foreground">
											Adapter Core
										</h2>
									</div>
									<p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-10">
										To bypass manual configuration, the client utilizes specialized local adapter routines. Each adapter represents a standalone, isolated engine that handles formatting schemas and path bindings.
									</p>

									{/* Grid list of adapters - Spacious gap-8 */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
										<div className="p-8 border border-[#3e4944] bg-[#181d1a] rounded-[2px] hover:border-[#ff5722] hover:bg-[#202622] hover:shadow-[0_0_20px_rgba(255,87,34,0.15)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300">
											<h4 className="text-foreground font-semibold font-mono text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
												<span className="w-1.5 h-1.5 rounded-full bg-[#ff5722]" />
												Cursor
											</h4>
											<p className="text-xs text-[#bdc9c2] leading-relaxed">
												Appends and merges new stdio tool definitions dynamically into workspace files located at <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944] font-semibold">.cursor/mcp.json</code> or global user configurations at <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944] font-semibold">~/.cursor/mcp.json</code>.
											</p>
										</div>

										<div className="p-8 border border-[#3e4944] bg-[#181d1a] rounded-[2px] hover:border-[#33bbc5] hover:bg-[#202622] hover:shadow-[0_0_20px_rgba(51,187,197,0.15)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300">
											<h4 className="text-foreground font-semibold font-mono text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
												<span className="w-1.5 h-1.5 rounded-full bg-[#33bbc5]" />
												Windsurf
											</h4>
											<p className="text-xs text-[#bdc9c2] leading-relaxed">
												Safely maps stdio parameters into the nested JSON objects of <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944] font-semibold">~/.codeium/windsurf/mcp_config.json</code> without wiping other items.
											</p>
										</div>

										<div className="p-8 border border-[#3e4944] bg-[#181d1a] rounded-[2px] hover:border-[#a0fdda] hover:bg-[#202622] hover:shadow-[0_0_20px_rgba(160,253,218,0.15)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300">
											<h4 className="text-foreground font-semibold font-mono text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
												<span className="w-1.5 h-1.5 rounded-full bg-[#a0fdda]" />
												Continue
											</h4>
											<p className="text-xs text-[#bdc9c2] leading-relaxed">
												Updates lists inside <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944] font-semibold">~/.continue/config.json</code>, linking new context providers and system config instructions.
											</p>
										</div>

										<div className="p-8 border border-[#3e4944] bg-[#181d1a] rounded-[2px] hover:border-[#e040fb] hover:bg-[#202622] hover:shadow-[0_0_20px_rgba(224,64,251,0.15)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300">
											<h4 className="text-foreground font-semibold font-mono text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
												<span className="w-1.5 h-1.5 rounded-full bg-[#e040fb]" />
												Hermes & OpenClaw
											</h4>
											<p className="text-xs text-[#bdc9c2] leading-relaxed">
												Applies clean YAML merges inside <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944] font-semibold">~/.hermes/config.yaml</code>, maintaining manual developer comments intact throughout the file.
											</p>
										</div>
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
								<section id="prerequisites" className="scroll-mt-28">
									<div className="flex items-center gap-2.5 mb-8">
										<Server className="h-6 w-6 text-[#a0fdda]" />
										<h2 className="text-2xl font-semibold tracking-tight text-foreground">
											Prerequisites
										</h2>
									</div>

									<div className="prose prose-invert max-w-none text-sm text-[#bdc9c2] leading-relaxed space-y-8">
										<p className="max-w-3xl">
											Because the codebase is modular, hosting VibeBasket internally inside your corporate network or cluster is extremely straightforward.
										</p>

										{/* Warning Callout - Spacious (my-10) */}
										<div className="flex gap-4 p-8 border-l-2 border-amber-400 bg-amber-400/5 rounded-r-[2px] my-10">
											<AlertTriangle className="h-5.5 w-5.5 text-amber-400 shrink-0 mt-0.5" />
											<div>
												<h4 className="font-mono text-[11px] uppercase tracking-widest text-amber-400 font-semibold mb-3">
													Concurrency & WAL Mode
												</h4>
												<p className="text-xs text-muted-foreground/90 leading-relaxed">
													To support seamless reader-writer concurrency and eliminate transactional locking during high-traffic catalog updates, the local SQLite database uses Write-Ahead Logging (WAL) mode activated dynamically at bootstrap.
												</p>
											</div>
										</div>

										<div className="space-y-6 text-muted-foreground">
											<p>
												1. **Configure Environment Variables:** Rename <code className="font-mono text-xs text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944] font-semibold">.env.example</code> to <code className="font-mono text-xs text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944] font-semibold">.env</code> and populate:
											</p>
											<pre className="bg-[#0d110f] p-6 border border-[#3e4944] font-mono text-xs text-muted-foreground overflow-x-auto rounded-[2px] my-6">
{`DATABASE_URL="file:vibebasket.db"
TRUST_PROXY=true # Enable if behind Cloudflare/Nginx proxy for correct rate limiting
AUTH_GITHUB_ID="your-github-oauth-id"
AUTH_GITHUB_SECRET="your-github-oauth-secret"
ADMIN_OAUTH_EMAILS="team@company.com" # Grants stats dashboard access`}
											</pre>
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
