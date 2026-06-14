import { KeyRound, ShieldAlert } from "lucide-react";
import Link from "next/link";

export function DocsTabSecurity() {
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
        <span className="text-foreground">Secret Security</span>
      </div>

      <div className="mb-24">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
          Secret Security
        </h1>
        <p className="text-base sm:text-lg text-[#bdc9c2] max-w-3xl leading-relaxed">
          Strict secure coding rules, zero-trust cloud storage models, and local secret shielding
          mechanisms.
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
              Security is the primary directive of VibeBasket. Sensitive keys (such as OpenAI or
              GitHub API tokens used by installed MCP servers never transit to or get cached inside
              our bundle database.
            </p>

            <div className="flex gap-4 p-8 border-l-2 border-red-500 bg-red-500/5 rounded-r-[2px] my-10">
              <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-widest text-red-400 font-semibold mb-3">
                  Zero-Trust Cloud Policy
                </h4>
                <p className="text-xs text-muted-foreground/90 leading-relaxed">
                  Bundle manifests never contain end-user runtime secrets. The hosted app stores
                  selected catalog metadata and optional encrypted admin backup-storage credentials,
                  but not the API keys that installed MCPs or agent tools use at runtime.
                </p>
              </div>
            </div>

            <p className="max-w-3xl">
              Instead, when applying a bundle locally, the CLI parses target credential keys and
              safely prompts the user inside the local terminal scope to inject them securely.
            </p>
          </div>
        </section>

        <section id="rate-limiting" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <ShieldAlert className="h-6 w-6 text-[#a0fdda]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Rate Limiting</h2>
          </div>
          <div className="prose prose-invert max-w-none text-sm text-[#bdc9c2] leading-relaxed space-y-8">
            <p className="max-w-3xl">
              All public API endpoints are protected by a sliding-window rate limiter with per-IP
              tracking and automatic garbage collection. Proxy-derived IP headers are only trusted
              when self-hosters explicitly enable proxy trust.
            </p>
            <div className="overflow-x-auto">
              <table
                className="w-full border border-[#3e4944]"
                aria-label="API rate limiting endpoints"
              >
                <caption className="sr-only">API endpoint rate limits</caption>
                <thead className="bg-[#181d1a]">
                  <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-[#bdc9c2]">
                    <th className="p-3 border-b border-[#3e4944] pl-4">Endpoint</th>
                    <th className="p-3 border-b border-[#3e4944]">Limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3e4944] font-mono text-[11px] text-[#bdc9c2]">
                  {[
                    ["/api/health", "120/min"],
                    ["/api/catalog", "120/min"],
                    ["/api/auth/*", "60/min"],
                    ["/api/bundle/[id]", "60/min"],
                    ["/api/stacks", "30/min"],
                    ["/api/admin/stats", "30/min"],
                    ["/api/catalog/status", "5/min"],
                    ["/api/bundle POST", "20/min"],
                  ].map(([ep, lim]) => (
                    <tr key={ep} className="hover:bg-[#1c211e]/40 transition-colors">
                      <td className="p-3 pl-4 text-[#a0fdda]">{ep}</td>
                      <td className="p-3">{lim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="security-headers" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <KeyRound className="h-6 w-6 text-[#e040fb]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Security Headers
            </h2>
          </div>
          <div className="prose prose-invert max-w-none text-sm text-[#bdc9c2] leading-relaxed space-y-8">
            <p className="max-w-3xl">
              All API responses include hardened headers. In production, a Content-Security-Policy
              and HSTS are also enforced.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border border-[#3e4944]" aria-label="HTTP security headers">
                <caption className="sr-only">Security response headers</caption>
                <thead className="bg-[#181d1a]">
                  <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-[#bdc9c2]">
                    <th className="p-3 border-b border-[#3e4944] pl-4">Header</th>
                    <th className="p-3 border-b border-[#3e4944]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3e4944] font-mono text-[11px] text-[#bdc9c2]">
                  {[
                    ["X-Frame-Options", "DENY"],
                    ["X-Content-Type-Options", "nosniff"],
                    ["Referrer-Policy", "strict-origin-when-cross-origin"],
                    ["X-Permitted-Cross-Domain-Policies", "none"],
                    ["X-Download-Options", "noopen"],
                    ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
                    ["Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload"],
                    [
                      "Content-Security-Policy",
                      "default-src 'self'; script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'",
                    ],
                  ].map(([h, v]) => (
                    <tr key={h} className="hover:bg-[#1c211e]/40 transition-colors">
                      <td className="p-3 pl-4 text-[#a0fdda]">{h}</td>
                      <td className="p-3">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="admin-panel" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <ShieldAlert className="h-6 w-6 text-[#ffb300]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Admin Panel Security
            </h2>
          </div>
          <div className="prose prose-invert max-w-none text-sm text-[#bdc9c2] leading-relaxed space-y-8">
            <p className="max-w-3xl">
              The admin dashboard at{" "}
              <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                /admin
              </code>{" "}
              is gated behind OAuth-authenticated sessions. Access is restricted to email addresses
              listed in the{" "}
              <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                ADMIN_OAUTH_EMAILS
              </code>{" "}
              environment variable.
            </p>
            <div className="overflow-x-auto">
              <table
                className="w-full border border-[#3e4944]"
                aria-label="Admin panel security features"
              >
                <caption className="sr-only">Admin panel security controls</caption>
                <thead className="bg-[#181d1a]">
                  <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-[#bdc9c2]">
                    <th className="p-3 border-b border-[#3e4944] pl-4">Feature</th>
                    <th className="p-3 border-b border-[#3e4944]">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3e4944] font-mono text-[11px] text-[#bdc9c2]">
                  {[
                    [
                      "Catalog Sync",
                      "Manually trigger registry synchronization from upstream sources.",
                    ],
                    [
                      "Backup Mgmt",
                      "Create, list, download, and restore database backups to any configured storage backend.",
                    ],
                    [
                      "FTS5 Index Health",
                      "Verify the full-text search index row count against the catalog table for integrity.",
                    ],
                    [
                      "DB Health Check",
                      "Run database integrity diagnostics and detect corruption early.",
                    ],
                    [
                      "Force Cleanup",
                      "Purge expired bundles, stale sessions, verification tokens, and old sync records, then vacuum.",
                    ],
                    [
                      "User Overview",
                      "Inspect registered user counts, saved stack telemetry, and popularity leaderboards.",
                    ],
                    [
                      "Admin Emails",
                      "Configure the comma-separated admin email allowlist persisted as site config.",
                    ],
                  ].map(([feat, desc]) => (
                    <tr key={feat} className="hover:bg-[#1c211e]/40 transition-colors">
                      <td className="p-3 pl-4 text-[#a0fdda]">{feat}</td>
                      <td className="p-3">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="max-w-3xl mt-6">
              All admin actions are server-side only and require a verified, administrator-role
              session. Rate limiting on the{" "}
              <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                /api/admin/stats
              </code>{" "}
              endpoint is 30 requests per minute.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
