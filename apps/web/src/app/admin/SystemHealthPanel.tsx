"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
	getFts5HealthAction,
	rebuildFts5Action,
	getDbHealthAction,
	forceCleanupAction,
	getUserOverviewAction,
} from "./actions";

interface Fts5Health {
	healthy: boolean;
	catalogRows: number;
	ftsRows: number;
}

interface DbHealth {
	catalogItems: number;
	bundles: number;
	users: number;
	savedStacks: number;
	integrityOk: boolean;
}

interface UserOverview {
	totalUsers: number;
	recentUsers: number;
	totalStacks: number;
}

export function SystemHealthPanel() {
	const [fts5, setFts5] = useState<Fts5Health | null>(null);
	const [dbHealth, setDbHealth] = useState<DbHealth | null>(null);
	const [userOverview, setUserOverview] = useState<UserOverview | null>(null);
	const [ftsLoading, setFtsLoading] = useState(false);
	const [dbLoading, setDbLoading] = useState(false);
	const [cleanupLoading, setCleanupLoading] = useState(false);
	const [userLoading, setUserLoading] = useState(false);

	const loadFts5 = async () => {
		setFtsLoading(true);
		const result = await getFts5HealthAction();
		if (result.success) {
			const r = result as unknown as Fts5Health;
			setFts5(r);
		} else {
			toast.error(result.error ?? "Failed");
		}
		setFtsLoading(false);
	};

	const handleRebuild = async () => {
		setFtsLoading(true);
		const result = await rebuildFts5Action();
		if (result.success) {
			toast.success("Search index rebuilt");
			await loadFts5();
		} else {
			toast.error(result.error ?? "Rebuild failed");
		}
		setFtsLoading(false);
	};

	const loadDbHealth = async () => {
		setDbLoading(true);
		const result = await getDbHealthAction();
		if (result.success) {
			const r = result as unknown as DbHealth;
			setDbHealth(r);
		} else {
			toast.error(result.error ?? "Failed");
		}
		setDbLoading(false);
	};

	const handleCleanup = async () => {
		setCleanupLoading(true);
		const result = await forceCleanupAction();
		if (result.success) {
			toast.success("Cleanup completed");
			await loadDbHealth();
		} else {
			toast.error(result.error ?? "Cleanup failed");
		}
		setCleanupLoading(false);
	};

	const loadUserOverview = async () => {
		setUserLoading(true);
		const result = await getUserOverviewAction();
		if (result.success) {
			const r = result as unknown as UserOverview;
			setUserOverview(r);
		} else {
			toast.error(result.error ?? "Failed");
		}
		setUserLoading(false);
	};

	return (
		<div className="mt-10 space-y-10">
			<div className="border-t border-border/80 pt-10">
				<h2 className="text-2xl font-semibold text-foreground mb-6">System Health</h2>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{/* FTS5 Index Card */}
					<div className="border border-border/80 bg-card/70 p-6">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
								Search Index
							</span>
							<span className={`inline-flex items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${
								fts5 === null
									? "border-border/70 bg-background/50 text-muted-foreground"
									: fts5.healthy
										? "border-accent/30 bg-accent/10 text-accent"
										: "border-destructive/30 bg-destructive/10 text-destructive"
							}`}>
								{fts5 === null ? "Not checked" : fts5.healthy ? "Healthy" : "Mismatch"}
							</span>
						</div>
						<div className="mt-6 text-4xl font-extrabold text-foreground">
							{fts5 === null ? "—" : `${fts5.ftsRows} / ${fts5.catalogRows}`}
						</div>
						<p className="mt-1 text-xs text-muted-foreground">
							FTS5 rows vs catalog rows
						</p>
						<div className="mt-5 flex gap-3 pt-5 border-t border-border/70">
							<button
								type="button"
								onClick={loadFts5}
								disabled={ftsLoading}
								className="border border-border/70 bg-background/40 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground disabled:opacity-50"
							>
								{ftsLoading ? "Checking..." : "Check"}
							</button>
							<button
								type="button"
								onClick={handleRebuild}
								disabled={ftsLoading}
								className="border border-accent/30 bg-accent/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
							>
								Rebuild
							</button>
						</div>
					</div>

					{/* DB Health Card */}
					<div className="border border-border/80 bg-card/70 p-6">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
								Database
							</span>
							<span className={`inline-flex items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${
								dbHealth === null
									? "border-border/70 bg-background/50 text-muted-foreground"
									: dbHealth.integrityOk
										? "border-accent/30 bg-accent/10 text-accent"
										: "border-destructive/30 bg-destructive/10 text-destructive"
							}`}>
								{dbHealth === null ? "Not checked" : dbHealth.integrityOk ? "OK" : "Corrupt"}
							</span>
						</div>
						<div className="mt-6 space-y-2 font-mono text-xs leading-6">
							{dbHealth && (
								<>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Catalog items</span>
										<span className="text-foreground">{dbHealth.catalogItems.toLocaleString()}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Bundles</span>
										<span className="text-foreground">{dbHealth.bundles.toLocaleString()}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Users</span>
										<span className="text-foreground">{dbHealth.users.toLocaleString()}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Saved stacks</span>
										<span className="text-foreground">{dbHealth.savedStacks.toLocaleString()}</span>
									</div>
								</>
							)}
						</div>
						<div className="mt-5 flex gap-3 pt-5 border-t border-border/70">
							<button
								type="button"
								onClick={loadDbHealth}
								disabled={dbLoading}
								className="border border-border/70 bg-background/40 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground disabled:opacity-50"
							>
								{dbLoading ? "Loading..." : "Check"}
							</button>
						</div>
					</div>

					{/* Force Cleanup Card */}
					<div className="border border-border/80 bg-card/70 p-6">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
								Force Cleanup
							</span>
							<span className="inline-flex items-center border border-border/70 bg-background/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
								Manual
							</span>
						</div>
						<div className="mt-6 text-sm text-muted-foreground leading-relaxed">
							Purges expired sessions, verification tokens, old sync records, and expired registered bundles. Runs a vacuum afterward.
						</div>
						<div className="mt-5 pt-5 border-t border-border/70">
							<button
								type="button"
								onClick={handleCleanup}
								disabled={cleanupLoading}
								className="inline-flex w-full items-center justify-center border border-accent/30 bg-accent/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
							>
								{cleanupLoading ? "Running..." : "Run Cleanup Now"}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* User Overview Section */}
			<div className="border-t border-border/80 pt-10">
				<h2 className="text-2xl font-semibold text-foreground mb-6">User Overview</h2>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					<div className="border border-border/80 bg-card/70 p-6">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
								Total Users
							</span>
							<span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
						</div>
						<div className="mt-6 text-4xl font-extrabold text-foreground">
							{userOverview === null ? "—" : userOverview.totalUsers.toLocaleString()}
						</div>
						<p className="mt-1 text-xs text-muted-foreground">
							{userOverview !== null && userOverview.recentUsers > 0
								? `${userOverview.recentUsers} new in the last 7 days`
								: "Registered accounts"}
						</p>
					</div>

					<div className="border border-border/80 bg-card/70 p-6">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
								Saved Stacks
							</span>
							<span className="h-2 w-2 rounded-full bg-accent" />
						</div>
						<div className="mt-6 text-4xl font-extrabold text-foreground">
							{userOverview === null ? "—" : userOverview.totalStacks.toLocaleString()}
						</div>
						<p className="mt-1 text-xs text-muted-foreground">
							User-curated bundles
						</p>
					</div>

					<div className="border border-border/80 bg-card/70 p-6 flex flex-col items-center justify-center">
						<button
							type="button"
							onClick={loadUserOverview}
							disabled={userLoading}
							className="border border-accent bg-accent/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
						>
							{userLoading ? "Loading..." : "Refresh User Stats"}
						</button>
						<p className="mt-3 text-[10px] text-muted-foreground">
							Queries users, stacks, and recent signups
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
