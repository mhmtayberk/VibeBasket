import { Info, Play, TerminalSquare } from "lucide-react";
import Link from "next/link";

export function DocsTabGettingStarted() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-12 flex items-center gap-2 select-none">
        <Link
          href="/docs"
          className="opacity-80 hover:text-[#a0fdda] transition-colors cursor-pointer"
        >
          Docs
        </Link>
        <span className="text-[#bdc9c2]/30">/</span>
        <span className="text-foreground">Getting Started</span>
      </div>
      <div className="mb-24">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
          Getting Started
        </h1>
        <p className="text-base sm:text-lg text-[#bdc9c2] max-w-3xl leading-relaxed">
          Welcome to the VibeBasket ecosystem. This guide provides a rapid introduction to
          initializing your workspace, understanding the core architecture, and applying your first
          AI-engineered setup bundle.
        </p>
      </div>
      <div className="space-y-28 border-t border-[#3e4944]/50 pt-20">
        <section id="overview" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-6">
            Core Methodology
          </h2>
          <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl">
            VibeBasket functions as the Ninite for Vibe Coding. It solves the friction of manually
            configuring developer toolchains, local agent rules, and Model Context Protocol (MCP)
            servers across different AI-assisted IDEs. By selecting custom components inside the web
            catalog, you curate an anonymous, reproducible bundle that consolidates all settings
            under a single immutable hash.
          </p>
          <div className="flex gap-4 p-8 border-l-2 border-[#33bbc5] bg-[#33bbc5]/5 rounded-r-[2px] my-10">
            <Info className="h-5 w-5 text-[#33bbc5] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#33bbc5] font-semibold mb-3">
                Bundle Lifecycle
              </h4>
              <p className="text-xs text-[#bdc9c2] leading-relaxed">
                Anonymous bundles created without an account expire after{" "}
                <strong className="text-foreground">48 hours</strong>. Registered user bundles
                persist for <strong className="text-foreground">365 days</strong>. Expired bundles
                are automatically purged by the platform&apos;s periodic cleanup job. Sign in via
                GitHub, Google, Apple, or Microsoft Entra ID to preserve your bundles long-term.
              </p>
            </div>
          </div>
        </section>
        <section id="installation" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <Play className="h-6 w-6 text-[#a0fdda] animate-pulse" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Installation</h2>
          </div>
          <div className="prose prose-invert max-w-none text-sm text-[#bdc9c2] leading-relaxed space-y-8">
            <p className="max-w-3xl">
              To inject this compiled developer context into your target codebase, copy the
              generated command and execute it inside your local project workspace:
            </p>
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
                  <span className="text-[#a0fdda]">npx</span> vibebasket apply{" "}
                  <span className="text-[#a0fdda]/85 font-semibold">cj2k9x</span>
                </pre>
              </div>
            </div>
            <div className="flex gap-4 p-8 border-l-2 border-[#a0fdda] bg-[#a0fdda]/5 rounded-r-[2px] my-10">
              <Info className="h-5 w-5 text-[#a0fdda] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#a0fdda] font-semibold mb-3">
                  Global CLI Usage
                </h4>
                <p className="text-xs text-[#bdc9c2] leading-relaxed">
                  The{" "}
                  <code className="font-mono text-[11px] text-[#a0fdda] bg-[#a0fdda]/10 px-1.5 py-0.5 rounded-[2px] border border-[#a0fdda]/20">
                    npx
                  </code>{" "}
                  command triggers an on-demand, lightweight sandbox runner to ensure you always
                  execute the latest registry structure without global dependency bloat. Power users
                  can globally register the client with{" "}
                  <code className="font-mono text-[11px] text-[#a0fdda] bg-[#a0fdda]/10 px-1.5 py-0.5 rounded-[2px] border border-[#a0fdda]/20">
                    npm i -g vibebasket
                  </code>{" "}
                  to enable the fast local{" "}
                  <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                    vb
                  </code>{" "}
                  alias directly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
