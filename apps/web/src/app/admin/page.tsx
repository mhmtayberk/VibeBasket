import { redirect } from "next/navigation";
import { desc, sql } from "drizzle-orm";
import {
	db,
	users,
	savedStacks,
	savedStackItems,
	catalogSyncRuns,
	catalogItems,
} from "@vibebasket/core";
import { requireAdminRole, ForbiddenError } from "@/lib/admin-session";
import { BackupSection } from "./BackupSection";
import { SyncButton } from "./SyncButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
	try {
		await requireAdminRole();
	} catch (error) {
		if (error instanceof ForbiddenError) {
			redirect("/");
		}
	}

	const [
		userCountResult,
		stackCountResult,
		popularItems,
		lastSyncResult,
		catalogCounts,
	] = await Promise.all([
		db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(users),
		db
			.select({ count: sql<number>`count(*)`.mapWith(Number) })
			.from(savedStacks),
		db
			.select({
				catalogItemId: savedStackItems.catalogItemId,
				displayName: savedStackItems.snapshotDisplayName,
				type: savedStackItems.catalogItemType,
				count:
					sql<number>`count(${savedStackItems.catalogItemId})`.mapWith(Number),
			})
			.from(savedStackItems)
			.groupBy(
				savedStackItems.catalogItemId,
				savedStackItems.snapshotDisplayName,
				savedStackItems.catalogItemType,
			)
			.orderBy(desc(sql`count(${savedStackItems.catalogItemId})`))
			.limit(5),
		db
			.select()
			.from(catalogSyncRuns)
			.orderBy(desc(catalogSyncRuns.completedAt))
			.limit(1),
		db
			.select({
				type: catalogItems.type,
				count: sql<number>`count(*)`.mapWith(Number),
			})
			.from(catalogItems)
			.groupBy(catalogItems.type),
	]);

	const totalUsers = userCountResult[0]?.count || 0;
	const totalStacks = stackCountResult[0]?.count || 0;
	const lastSync = lastSyncResult[0] || null;

	const catalogStats = {
		mcp: 0,
		skill: 0,
		rule: 0,
		workflow: 0,
	};
	for (const item of catalogCounts) {
		if (item.type in catalogStats) {
			catalogStats[item.type as keyof typeof catalogStats] = item.count;
		}
	}

	return (
		<div className="min-h-screen bg-background text-foreground font-sans antialiased">
			<header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
				<div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-4">
						<Link
							href="/"
							className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
						>
							VibeBasket
						</Link>
						<span className="inline-flex items-center border border-accent/30 bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
							Admin
						</span>
					</div>
					<Link
						href="/"
						className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
					>
						Back to Catalog
					</Link>
				</div>
			</header>

			<main className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
				<div className="mb-10">
					<h1 className="text-3xl font-bold tracking-tight text-foreground">
						System Operations &amp; Metrics
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Real-time analytics, user saved stack leaderboards, and central
						registry health.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					<div className="border border-border/80 bg-card/70 p-6">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
								Active Base
							</span>
							<span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
						</div>
						<div className="mt-6 text-4xl font-extrabold text-foreground">
							{totalUsers}
						</div>
						<p className="mt-1 text-xs text-muted-foreground">
							Registered users utilizing stacks
						</p>
					</div>

					<div className="border border-border/80 bg-card/70 p-6">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
								Saved Ecosystems
							</span>
							<span className="h-2 w-2 rounded-full bg-accent" />
						</div>
						<div className="mt-6 text-4xl font-extrabold text-foreground">
							{totalStacks}
						</div>
						<p className="mt-1 text-xs text-muted-foreground">
							Named bundles successfully configured
						</p>
					</div>

					<div className="border border-border/80 bg-card/70 p-6">
						<div className="flex items-center justify-between mb-4">
							<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
								Registry Sync
							</span>
							<span
								className={`inline-flex items-center font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 border ${
									lastSync?.success
										? "border-accent/30 bg-accent/10 text-accent"
										: "border-destructive/30 bg-destructive/10 text-destructive"
								}`}
							>
								{lastSync?.success ? "Success" : "Failed"}
							</span>
						</div>

						<div className="space-y-3 font-mono text-xs leading-6">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Last Synced</span>
								<span className="text-foreground">
									{lastSync
										? new Date(lastSync.completedAt).toLocaleString()
										: "Never"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Duration</span>
								<span className="text-foreground">
									{lastSync
										? `${(lastSync.durationMs / 1000).toFixed(2)}s`
										: "0s"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Ingested MCPs</span>
								<span className="text-foreground">
									{lastSync?.mcps || 0}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Ingested Skills</span>
								<span className="text-foreground">
									{lastSync?.skills || 0}
								</span>
							</div>
						</div>

						<div className="mt-5 pt-5 border-t border-border/70">
							<SyncButton />
						</div>
					</div>

					<div className="border border-border/80 bg-card/70 p-6 md:col-span-2 md:row-span-2">
						<div className="flex items-center justify-between mb-5">
							<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
								Popular Integrations
							</span>
							<span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
								Top 5 Selections
							</span>
						</div>

						{popularItems.length === 0 ? (
							<div className="flex h-40 items-center justify-center border border-dashed border-border/70 text-xs text-muted-foreground">
								No stack items saved yet. Popularity calculations will appear
								once users save bundles.
							</div>
						) : (
							<div className="w-full overflow-x-auto">
								<table className="w-full text-left">
									<thead>
										<tr className="border-b border-border/70">
											<th className="pb-3 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground w-12">
												#
											</th>
											<th className="pb-3 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
												Integration
											</th>
											<th className="pb-3 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
												Type
											</th>
											<th className="pb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground text-right">
												Usage
											</th>
										</tr>
									</thead>
									<tbody>
										{popularItems.map((item, idx) => (
											<tr
												key={item.catalogItemId}
												className="border-b border-border/50 last:border-b-0"
											>
												<td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
													{idx + 1}
												</td>
												<td className="py-3 pr-4">
													<div className="text-sm font-medium text-foreground">
														{item.displayName}
													</div>
													<div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
														{item.catalogItemId}
													</div>
												</td>
												<td className="py-3 pr-4">
													<span className="inline-flex border border-border/70 bg-background/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
														{item.type}
													</span>
												</td>
												<td className="py-3 text-right font-mono text-sm font-semibold text-accent">
													{item.count}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}

						<p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
							Aggregated across all user-owned active configurations.
						</p>
					</div>

					<div className="border border-border/80 bg-card/70 p-6 md:col-span-3">
						<div className="flex items-center justify-between mb-5">
							<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
								Central Catalog Registry Composition
							</span>
							<span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
								{catalogStats.mcp +
									catalogStats.skill +
									catalogStats.rule +
									catalogStats.workflow}{" "}
								items
							</span>
						</div>

						<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
							<div className="border border-border/70 bg-background/40 p-4">
								<div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
									MCP Servers
								</div>
								<div className="mt-2 text-2xl font-bold text-foreground">
									{catalogStats.mcp}
								</div>
							</div>
							<div className="border border-border/70 bg-background/40 p-4">
								<div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
									Skills
								</div>
								<div className="mt-2 text-2xl font-bold text-foreground">
									{catalogStats.skill}
								</div>
							</div>
							<div className="border border-border/70 bg-background/40 p-4">
								<div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
									Rules
								</div>
								<div className="mt-2 text-2xl font-bold text-foreground">
									{catalogStats.rule}
								</div>
							</div>
							<div className="border border-border/70 bg-background/40 p-4">
								<div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
									Workflows
								</div>
								<div className="mt-2 text-2xl font-bold text-foreground">
									{catalogStats.workflow}
								</div>
							</div>
						</div>
					</div>

					<div className="border border-border/80 bg-card/70 p-6 md:col-span-3">
						<BackupSection />
					</div>
				</div>
			</main>
		</div>
	);
}
