import {
	ArrowRight,
	BadgeCheck,
	Command,
	Lock,
	Sparkles,
	TerminalSquare,
	Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { siJetbrains, siZedindustries } from "simple-icons";
import { auth, getEnabledAuthProviders } from "@/auth";
import { AuthMenu } from "@/components/auth/AuthMenu";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { FloatingBasket } from "@/components/basket/FloatingBasket";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { TopToTopButton } from "@/components/layout/TopToTopButton";
import { getInitialCatalogSnapshot } from "@/lib/catalog-snapshot";
import { TARGET_OPTIONS } from "@/lib/targets";

export const dynamic = "force-dynamic";

export default async function Home() {
	const [initialCatalog, session] = await Promise.all([
		getInitialCatalogSnapshot(),
		auth(),
	]);
	const enabledProviders = getEnabledAuthProviders();
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

	const marqueeTargets = [
		...TARGET_OPTIONS.filter((target) => target.status === "supported"),
		...TARGET_OPTIONS.filter((target) => target.status === "supported"),
	];
	const sectionIds = {
		heroTitle: "hero-title",
		how: "how",
		catalog: "catalog",
		command: "command",
	} as const;

	const renderTargetIcon = (targetId: string) => {
		const imageFor = (src: string, altText: string) => (
			<Image
				src={src}
				alt={altText}
				width={24}
				height={24}
				priority
				className="h-6 w-auto object-contain"
			/>
		);

		const iconFor = (path: string, hex: string) => (
			<svg
				aria-hidden="true"
				viewBox="0 0 24 24"
				className="h-5 w-5"
				style={{ color: hex === "000000" ? "#f5f7fb" : `#${hex}` }}
			>
				<path d={path} fill="currentColor" />
			</svg>
		);

		switch (targetId) {
			case "cursor":
				return imageFor("/targets/cursor.svg", "Cursor");
			case "windsurf":
				return imageFor("/targets/windsurf.svg", "Windsurf");
			case "vscode":
				return imageFor("/targets/vscode.svg", "VS Code");
			case "antigravity":
				return imageFor("/targets/antigravity.svg", "Antigravity");
			case "claude-code":
				return imageFor("/targets/claude-code.svg", "Claude Code");
			case "zed":
				return iconFor(siZedindustries.path, siZedindustries.hex);
			case "codex":
				return imageFor("/targets/codex.svg", "Codex");
			case "gemini-cli":
				return imageFor("/targets/gemini.svg", "Gemini CLI");
			case "junie":
				return iconFor(siJetbrains.path, siJetbrains.hex);
			case "kiro":
				return imageFor("/targets/kiro-cli.svg", "Kiro CLI");
			case "cline-cli":
				return imageFor("/targets/cline.svg", "Cline CLI");
			case "continue":
				return (
					<svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" style={{ color: "#00E5FF" }}>
						<path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 12a8 8 0 0113.65-5.65L20 9m0 0v-4m0 4h-4M20 12a8 8 0 01-13.65 5.65L4 15m0 0v4m0-4h4" />
					</svg>
				);
			case "roocode":
				return (
					<svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" style={{ color: "#FF3D00" }}>
						<path fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
					</svg>
				);
			case "hermes":
				return (
					<svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" style={{ color: "#FFD600" }}>
						<path fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM8 11h8" />
					</svg>
				);
			case "openclaw":
				return (
					<svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" style={{ color: "#E040FB" }}>
						<path fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M12 3a9 9 0 019 9M12 21a9 9 0 01-9-9" />
					</svg>
				);
			case "deepseek-tui":
				return (
					<svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" style={{ color: "#1C6EF2" }}>
						<path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
					</svg>
				);
			default:
				return <Command className="h-4 w-4 text-accent" />;
		}
	};

	return (
		<main className="min-h-screen bg-background text-foreground">
			<header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
				<div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-8">
						<Link
							href="/"
							className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
						>
							VibeBasket
						</Link>

						<nav className="hidden items-center gap-6 lg:flex">
							<a
								href={`#${sectionIds.how}`}
								className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
							>
								How it works
							</a>
							<a
								href={`#${sectionIds.catalog}`}
								className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
							>
								Catalog
							</a>
							<a
								href={`#${sectionIds.command}`}
								className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent cursor-pointer"
							>
								Install flow
							</a>
							<Link
								href="/docs"
								className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent cursor-pointer"
							>
								Documentation
							</Link>
						</nav>
					</div>

					<div className="flex items-center gap-3">
						{session?.user ? (
							<AuthMenu session={session} />
						) : (
							<SignInDialog
								providers={enabledProviders}
								callbackUrl="/"
								triggerLabel="Login"
								triggerClassName="inline-flex items-center gap-2 border border-border/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
							/>
						)}
						<a
							href={`#${sectionIds.catalog}`}
							className="inline-flex items-center gap-2 border border-accent bg-accent/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							Build your basket
							<ArrowRight className="h-3.5 w-3.5" />
						</a>
					</div>
				</div>
			</header>

			<script type="application/ld+json">
				{JSON.stringify(structuredData)}
			</script>

			<section
				className="border-b border-border/80"
				aria-labelledby={sectionIds.heroTitle}
			>
				<div className="mx-auto grid max-w-[1440px] gap-14 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:px-8 lg:py-20">
					<div className="flex flex-col justify-center">
						<div className="inline-flex w-fit items-center gap-2 border border-border/80 bg-card/70 px-3 py-1.5">
							<span className="h-2 w-2 rounded-full bg-accent" />
							<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
								Public beta
							</span>
						</div>

						<h1
							id={sectionIds.heroTitle}
							className="mt-8 max-w-3xl text-[2.5rem] font-semibold leading-[0.98] tracking-[-0.05em] text-foreground sm:text-[3.55rem] lg:text-[4.45rem]"
						>
							Bundle your AI
							<br />
							dev setup.
							<br />
							Share it with
							<br />
							one link.
						</h1>

						<p className="mt-8 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
							Curate trusted MCP servers, reusable skills, and project rules.
							Generate one install command that travels cleanly across Cursor,
							Windsurf, VS Code, and the rest of your AI coding stack.
						</p>

						<div className="mt-10 flex flex-col gap-3 sm:flex-row">
							<a
								href={`#${sectionIds.catalog}`}
								className="inline-flex h-12 items-center justify-center gap-2 border border-accent bg-accent px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:bg-accent/90"
							>
								Start building free
							</a>
							<a
								href={`#${sectionIds.catalog}`}
								className="inline-flex h-12 items-center justify-center gap-2 border border-border/80 bg-card/70 px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-accent/40 hover:text-accent"
							>
								<TerminalSquare className="h-4 w-4" />
								View catalog
							</a>
						</div>

						<div className="mt-10 overflow-hidden border-y border-border/70 py-4">
							<div className="relative overflow-hidden">
								<div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent" />
								<div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent" />
								<div className="flex min-w-max animate-[marquee_20s_linear_infinite] gap-3 pr-3 [will-change:transform]">
									{marqueeTargets.map((ide, index) => (
										<div
											key={`${ide.id}-${index}`}
											title={ide.label}
											className="inline-flex h-11 min-w-11 items-center justify-center px-2 text-muted-foreground"
										>
											<span className="sr-only">{ide.label}</span>
											{renderTargetIcon(ide.id)}
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					<div className="border border-border/80 bg-card/70">
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
										<div>
											<p className="text-sm font-semibold text-foreground">
												github-mcp
											</p>
											<p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
												repository context
											</p>
										</div>
										<BadgeCheck className="h-4 w-4 text-accent" />
									</div>
								</div>

								<div className="border border-border/70 bg-background/30 p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-semibold text-foreground">
												typescript-strict
											</p>
											<p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
												coding rules
											</p>
										</div>
										<Workflow className="h-4 w-4 text-muted-foreground" />
									</div>
								</div>
							</div>

							<div className="border border-border/70 bg-background/35 p-4">
								<div className="flex items-center justify-between gap-4">
									<span className="truncate font-mono text-[12px] text-accent">
										$ npx vibebasket apply cj2k9x
									</span>
									<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
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
									<p className="mt-3 text-sm font-medium text-foreground">
										Trusted discovery
									</p>
									<p className="mt-2 text-sm leading-6 text-muted-foreground">
										Official registries and curated records, deduped into one
										catalog.
									</p>
								</div>
								<div className="border border-border/70 bg-background/35 p-4">
									<Lock className="h-4 w-4 text-accent" />
									<p className="mt-3 text-sm font-medium text-foreground">
										Local secrets
									</p>
									<p className="mt-2 text-sm leading-6 text-muted-foreground">
										Sensitive values stay on your machine during apply.
									</p>
								</div>
								<div className="border border-border/70 bg-background/35 p-4">
									<BadgeCheck className="h-4 w-4 text-accent" />
									<p className="mt-3 text-sm font-medium text-foreground">
										Safe re-runs
									</p>
									<p className="mt-2 text-sm leading-6 text-muted-foreground">
										Idempotent writes with backups so setup changes stay
										reversible.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section id={sectionIds.how} className="border-b border-border/80">
				<div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
					<div className="grid gap-6 lg:grid-cols-3">
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
							<article
								key={item.step}
								className="border border-border/80 bg-card/60 p-6"
							>
								<p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
									{item.step}
								</p>
								<h2 className="mt-5 text-2xl font-semibold text-foreground">
									{item.title}
								</h2>
								<p className="mt-4 text-sm leading-7 text-muted-foreground">
									{item.body}
								</p>
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
				<div className="mx-auto max-w-[1440px] px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
					<h2 className="mx-auto max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-foreground sm:text-7xl">
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

			<footer className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 border-t border-border/40 mt-20">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="text-2xl font-semibold text-foreground">VibeBasket</p>
						<p className="mt-3 max-w-xl leading-7 text-muted-foreground/80 text-sm">
							AI-engineered setup infrastructure for teams that want reproducible
							context across modern coding tools.
						</p>
					</div>

					<div className="flex flex-wrap gap-5 font-mono text-[11px] uppercase tracking-[0.18em]">
						<a
							href={`#${sectionIds.how}`}
							className="transition-colors hover:text-accent cursor-pointer"
						>
							Workflow
						</a>
						<a
							href={`#${sectionIds.catalog}`}
							className="transition-colors hover:text-accent cursor-pointer"
						>
							Catalog
						</a>
						<a
							href={`#${sectionIds.command}`}
							className="transition-colors hover:text-accent cursor-pointer"
						>
							Install flow
						</a>
						<Link
							href="/docs"
							className="transition-colors hover:text-accent cursor-pointer"
						>
							Documentation
						</Link>
					</div>
				</div>

				<div className="mt-8 pt-8 border-t border-border/20 flex justify-center items-center">
					<p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5 justify-center text-center">
						Made with <span className="text-accent animate-pulse">♥</span> by <span className="text-foreground hover:text-accent transition-colors duration-200 cursor-default">Vibe Coding</span> for <span className="text-accent font-medium">Vibe Coders</span>
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
