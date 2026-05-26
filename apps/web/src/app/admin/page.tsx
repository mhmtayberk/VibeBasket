import { redirect } from "next/navigation";
import { desc, sql } from "drizzle-orm";
import {
  db,
  users,
  savedStacks,
  savedStackItems,
  catalogSyncRuns,
  catalogItems
} from "@vibebasket/core";
import { requireAdminRole, ForbiddenError } from "@/lib/admin-session";
import { SyncButton } from "./SyncButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  try {
    // Assert secure authorization at the server level
    await requireAdminRole();
  } catch (error) {
    if (error instanceof ForbiddenError) {
      redirect("/");
    }
  }

  // Fetch stats directly in the Server Component for maximum performance
  const [
    userCountResult,
    stackCountResult,
    popularItems,
    lastSyncResult,
    catalogCounts
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(users),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(savedStacks),
    db
      .select({
        catalogItemId: savedStackItems.catalogItemId,
        displayName: savedStackItems.snapshotDisplayName,
        type: savedStackItems.catalogItemType,
        count: sql<number>`count(${savedStackItems.catalogItemId})`.mapWith(Number),
      })
      .from(savedStackItems)
      .groupBy(
        savedStackItems.catalogItemId,
        savedStackItems.snapshotDisplayName,
        savedStackItems.catalogItemType
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
      .groupBy(catalogItems.type)
  ]);

  const totalUsers = userCountResult[0]?.count || 0;
  const totalStacks = stackCountResult[0]?.count || 0;
  const lastSync = lastSyncResult[0] || null;

  const catalogStats = {
    mcp: 0,
    skill: 0,
    rule: 0,
    workflow: 0
  };
  for (const item of catalogCounts) {
    if (item.type in catalogStats) {
      catalogStats[item.type as keyof typeof catalogStats] = item.count;
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] font-sans antialiased selection:bg-[#222] selection:text-white relative overflow-hidden">
      {/* Background radial gradient decoration */}
      <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#1a1a2e]/30 to-transparent blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.05] bg-[#050505]/80 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-mono text-lg font-bold tracking-tight text-white group-hover:text-white/80 transition-colors">
                VIBE<span className="text-[#a855f7]">BASKET</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/50 scale-90">
                Admin
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
      </header>

      {/* Main Bento Area */}
      <main className="container max-w-7xl mx-auto px-4 py-10 relative z-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            System Operations & Metrics
          </h1>
          <p className="text-neutral-400 text-sm">
            Real-time analytics, user saved stack leaderboards, and central registry health.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[160px]">
          {/* Card 1: Total Registered Users */}
          <div className="col-span-1 rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-md p-6 flex flex-col justify-between hover:bg-white/[0.04] transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-widest text-[#a855f7] uppercase">
                Active Base
              </span>
              <div className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white group-hover:scale-[1.02] transition-transform origin-left">
                {totalUsers}
              </div>
              <p className="text-xs text-neutral-400 mt-1">Registered users utilizing stacks</p>
            </div>
          </div>

          {/* Card 2: Total Saved Stacks */}
          <div className="col-span-1 rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-md p-6 flex flex-col justify-between hover:bg-white/[0.04] transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-widest text-emerald-500 uppercase">
                Saved Ecosystems
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white group-hover:scale-[1.02] transition-transform origin-left">
                {totalStacks}
              </div>
              <p className="text-xs text-neutral-400 mt-1">Named bundles successfully configured</p>
            </div>
          </div>

          {/* Card 3: Sync Operations Control */}
          <div className="col-span-1 row-span-2 rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-md p-6 flex flex-col justify-between hover:bg-white/[0.04] transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
                  Registry Sync
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase ${lastSync?.success ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                  {lastSync?.success ? "Success" : "Failed"}
                </span>
              </div>
              
              <div className="space-y-3 font-mono text-xs text-neutral-300">
                <div>
                  <span className="text-neutral-500">Last Synced:</span>{" "}
                  <span className="text-white">
                    {lastSync ? new Date(lastSync.completedAt).toLocaleString() : "Never"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Duration:</span>{" "}
                  <span className="text-white">
                    {lastSync ? `${(lastSync.durationMs / 1000).toFixed(2)}s` : "0s"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Ingested MCPs:</span>{" "}
                  <span className="text-white">{lastSync?.mcps || 0}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Ingested Skills:</span>{" "}
                  <span className="text-white">{lastSync?.skills || 0}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.05]">
              <SyncButton />
            </div>
          </div>

          {/* Card 4: Leaderboard - Popular Stacks */}
          <div className="col-span-1 md:col-span-2 row-span-2 rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-md p-6 flex flex-col justify-between hover:bg-white/[0.04] transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono tracking-widest text-[#a855f7] uppercase">
                  Popular Integrations
                </span>
                <span className="text-xs text-neutral-500 font-mono">Top 5 Selections</span>
              </div>

              {popularItems.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-xs text-neutral-500 font-mono">
                  No stack items saved yet. Popularity calculations will appear once users save bundles.
                </div>
              ) : (
                <div className="space-y-3">
                  {popularItems.map((item, idx) => (
                    <div
                      key={item.catalogItemId}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.01] hover:bg-white/[0.03] transition-colors border border-white/[0.02]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-neutral-500 w-4">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {item.displayName}
                          </div>
                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                            {item.catalogItemId}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-neutral-400 uppercase">
                          {item.type}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#a855f7]">
                          {item.count} sets
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-[10px] text-neutral-500 font-mono mt-2">
              Aggregated across all user-owned active configurations.
            </div>
          </div>

          {/* Card 5: Catalog Distribution Stats */}
          <div className="col-span-1 md:col-span-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-md p-6 flex flex-col justify-between hover:bg-white/[0.04] transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-widest text-[#ededed] uppercase">
                Central Catalog Registry Composition
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                {catalogStats.mcp + catalogStats.skill + catalogStats.rule + catalogStats.workflow} items
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
              <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                <div className="text-xs text-neutral-400 font-mono mb-1">MCP Servers</div>
                <div className="text-2xl font-bold text-white tracking-tight">{catalogStats.mcp}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                <div className="text-xs text-neutral-400 font-mono mb-1">Claude Skills</div>
                <div className="text-2xl font-bold text-white tracking-tight">{catalogStats.skill}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                <div className="text-xs text-neutral-400 font-mono mb-1">Rules</div>
                <div className="text-2xl font-bold text-white tracking-tight">{catalogStats.rule}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                <div className="text-xs text-neutral-400 font-mono mb-1">Workflows</div>
                <div className="text-2xl font-bold text-white tracking-tight">{catalogStats.workflow}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
