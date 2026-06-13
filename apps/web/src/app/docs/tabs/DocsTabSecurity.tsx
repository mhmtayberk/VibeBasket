import Link from "next/link";
import { KeyRound, ShieldAlert } from "lucide-react";

export function DocsTabSecurity() {
	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
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
	);
}
