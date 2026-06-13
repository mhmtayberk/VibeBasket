import Link from "next/link";
import { Cpu, TerminalSquare } from "lucide-react";

export function DocsTabDelimiters() {
	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
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
              When writing rulesets, instructions, or custom skill profiles into codebases (for files like <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">.clinerules</code>, <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">.hermesrules</code>, <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">.voidrules</code>, <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">.openclawrules</code>, or <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">.aiderinstructions.md</code>), the CLI prevents code pollution by wrapping updates inside strict delimiters:
            </p>

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
	);
}
