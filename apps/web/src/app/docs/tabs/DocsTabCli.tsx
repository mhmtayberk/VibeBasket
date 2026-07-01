import { SUPPORTED_TARGET_COUNT } from "@/lib/targets";
import { TerminalSquare } from "lucide-react";
import Link from "next/link";

export function DocsTabCli() {
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
        <span className="text-foreground">CLI Reference</span>
      </div>

      <div className="mb-24">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
          CLI Reference
        </h1>
        <p className="text-base sm:text-lg text-[#bdc9c2] max-w-3xl leading-relaxed">
          Reference for the local installer and inspection commands. The CLI is designed to run on
          the operator's machine, apply bundles idempotently, and avoid pretending support that an
          adapter does not actually implement.
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
            The{" "}
            <code className="font-mono text-xs text-[#33bbc5] bg-[#33bbc5]/10 px-1.5 py-0.5 rounded-[2px] border border-[#33bbc5]/20">
              vibebasket
            </code>{" "}
            CLI works as an idempotent local installer. When a bundle URL or local manifest file is
            passed, it fetches the manifest, applies only the capabilities the target adapter really
            supports, skips targets or MCP entries it cannot represent safely, writes backups before
            mutating known config files when a real config change is required, and verifies the
            written result when readback is implemented for that target.
          </p>
        </section>

        <section id="commands" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-8">
            Available Commands
          </h2>
          <div className="space-y-4">
            <div className="p-8 border border-[#3e4944] bg-[#181d1a] rounded-[2px] hover:border-[#a0fdda] hover:bg-[#202622] hover:shadow-[0_0_20px_rgba(160,253,218,0.15)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300">
              <code className="font-mono text-[#a0fdda] text-sm font-semibold block mb-2">
                vibebasket apply &lt;url|file&gt;
              </code>
              <p className="text-xs text-[#bdc9c2] leading-relaxed">
                The primary command. Accepts a hosted bundle URL or a local JSON manifest file,
                validates its manifest, and applies each item (MCP servers, skills, rules) to every
                compatible local adapter. Adapters back up existing config files only when an MCP
                config mutation is actually needed and merge entries idempotently, so running apply
                twice is safe. If a target cannot support part of the bundle cleanly, the CLI
                reports that target as skipped instead of pretending the install succeeded.
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
                <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                  apply
                </code>{" "}
                remains the primary install path. Supporting commands such as{" "}
                <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                  list
                </code>
                ,{" "}
                <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                  search
                </code>
                ,{" "}
                <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                  doctor
                </code>
                ,{" "}
                <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                  init
                </code>
                , and{" "}
                <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                  rollback
                </code>{" "}
                are available today.
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
                    Skips the interactive trust confirmation and lets adapter MCP merges overwrite
                    an existing MCP entry when the same id is already present.
                  </td>
                </tr>
                <tr className="hover:bg-[#1c211e]/40 transition-colors">
                  <td className="p-5 pl-7 text-[#a0fdda] font-semibold">--scope / -s</td>
                  <td className="p-5">user | project</td>
                  <td className="p-5 pr-7 text-xs font-sans text-[#bdc9c2]/90 leading-relaxed">
                    Overrides the bundle's scope.{" "}
                    <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                      user
                    </code>{" "}
                    installs in home directory,{" "}
                    <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                      project
                    </code>{" "}
                    installs relative to the working directory.
                  </td>
                </tr>
                <tr className="hover:bg-[#1c211e]/40 transition-colors">
                  <td className="p-5 pl-7 text-[#a0fdda] font-semibold">--dry-run / -d</td>
                  <td className="p-5">Boolean</td>
                  <td className="p-5 pr-7 text-xs font-sans text-[#bdc9c2]/90 leading-relaxed">
                    Previews pending config changes without writing to disk. Shows the target
                    configuration that would be applied.
                  </td>
                </tr>
                <tr className="hover:bg-[#1c211e]/40 transition-colors">
                  <td className="p-5 pl-7 text-[#a0fdda] font-semibold">--no-verify</td>
                  <td className="p-5">Boolean</td>
                  <td className="p-5 pr-7 text-xs font-sans text-[#bdc9c2]/90 leading-relaxed">
                    Skips the post-install readback checks. Useful only for debugging or unusual
                    local environments where readback is temporarily unreliable.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section id="other-commands" className="scroll-mt-28">
        <div className="flex items-center gap-2.5 mb-8">
          <TerminalSquare className="h-6 w-6 text-[#a0fdda]" />
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Other Commands</h2>
        </div>
        <div className="space-y-6">
          <div className="border border-[#3e4944] p-6">
            <h3 className="font-mono text-[#a0fdda] text-xs font-semibold mb-3">vibebasket list</h3>
            <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl">{`Scans all ${SUPPORTED_TARGET_COUNT} IDE targets and reports installed MCP servers, skills, and rules per target.`}</p>
          </div>
          <div className="border border-[#3e4944] p-6">
            <h3 className="font-mono text-[#a0fdda] text-xs font-semibold mb-3">
              vibebasket search &lt;query&gt;
            </h3>
            <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl">
              Searches the VibeBasket catalog from the terminal using the FTS5 full-text index.
              Returns up to 10 matching items from the hosted catalog across MCPs, Skills, and
              Rules. The current terminal surface is intentionally lightweight and best for quick
              catalog discovery rather than full visual browsing.
            </p>
          </div>
          <div className="border border-[#3e4944] p-6">
            <h3 className="font-mono text-[#a0fdda] text-xs font-semibold mb-3">vibebasket init</h3>
            <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl">
              Scaffolds a `.vibebasket/` workspace structure plus a local `.vibebasket.env` file
              template for project-scoped secrets and assets.
            </p>
          </div>
          <div className="border border-[#3e4944] p-6">
            <h3 className="font-mono text-[#a0fdda] text-xs font-semibold mb-3">
              vibebasket doctor
            </h3>
            <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl">
              Diagnoses the local environment: checks for `.vibebasket` project structure, inspects
              adapter config presence, reports MCP counts where readable, and prints a concise
              environment summary for the current machine.
            </p>
          </div>
          <div className="border border-[#3e4944] p-6">
            <h3 className="font-mono text-[#a0fdda] text-xs font-semibold mb-3">
              vibebasket rollback
            </h3>
            <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl">
              Opens an interactive restore flow, lets you choose from recent timestamped backups,
              and then restores the selected adapter config snapshot. For project-scoped backups,
              run it from the same project root you want to restore into.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
