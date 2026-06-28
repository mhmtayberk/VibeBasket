import { AlertTriangle, Info, KeyRound, Server, TerminalSquare } from "lucide-react";
import Link from "next/link";

export function DocsTabSelfHosting() {
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
        <span className="text-foreground">Self-hosting</span>
      </div>

      <div className="mb-24">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
          Self-Hosting Guide
        </h1>
        <p className="text-base sm:text-lg text-[#bdc9c2] max-w-3xl leading-relaxed">
          Run VibeBasket on your own infrastructure with the single-node deployment shape the
          product is currently optimized for: one app process, one SQLite database, optional OAuth,
          and optional encrypted backup storage.
        </p>
      </div>

      <div className="space-y-28 border-t border-[#3e4944]/50 pt-20">
        <section id="docker" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <Server className="h-6 w-6 text-[#a0fdda]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Docker (recommended)
            </h2>
          </div>
          <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-8">
            The easiest way to self-host VibeBasket. The image is a lean multi-stage build based on
            Node.js 22 Alpine. The SQLite database file is persisted through a named Docker volume
            so your data survives container restarts and upgrades.
          </p>

          <div className="space-y-10">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-3">
                Step 1 — Clone &amp; configure
              </p>
              <pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`git clone https://github.com/vibebasket/vibebasket.git
cd vibebasket

# Copy the example env file and fill in your values
cp .env.example .env`}</pre>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-3">
                Step 2 — Start with Docker Compose
              </p>
              <pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`docker compose up -d

# View logs
docker compose logs -f web`}</pre>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-3">
                Step 3 — Seed the catalog
              </p>
              <pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`# Run the catalog sync inside the running container
docker compose exec web node scripts/catalog-sync.mjs`}</pre>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-3">
                Upgrading
              </p>
              <pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`git pull
docker compose up -d --build`}</pre>
            </div>
          </div>
        </section>

        <section id="helm" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <Server className="h-6 w-6 text-[#33bbc5]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Helm (Kubernetes)
            </h2>
          </div>
          <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-8">
            A fully-featured Helm chart is available in{" "}
            <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              charts/vibebasket/
            </code>
            . The chart deploys a single-replica Deployment with a ClusterIP Service, optional
            Ingress, and a PersistentVolumeClaim for the SQLite database. Non-secret runtime values
            belong under{" "}
            <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              .Values.env
            </code>
            , while secrets such as{" "}
            <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              AUTH_SECRET
            </code>{" "}
            and OAuth client secrets belong under{" "}
            <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              .Values.secretEnv
            </code>{" "}
            or an existing Kubernetes Secret.
          </p>
          <pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`git clone https://github.com/vibebasket/vibebasket.git
cd vibebasket

helm install vibebasket ./charts/vibebasket \\
  --set env.NEXTAUTH_URL=https://vibebasket.example.com \\
  --set secretEnv.AUTH_SECRET=$(openssl rand -base64 32) \\
  --set env.AUTH_GITHUB_ID=your-client-id \\
  --set secretEnv.AUTH_GITHUB_SECRET=your-client-secret \\
  --set env.AUTH_GITHUB_ENABLED=true \\
  --set persistence.size=5Gi

# Or install with a custom values file
helm install vibebasket ./charts/vibebasket -f my-values.yaml`}</pre>
        </section>

        <section id="manual" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <TerminalSquare className="h-6 w-6 text-[#33bbc5]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Manual Installation
            </h2>
          </div>
          <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-8">
            Requires Node.js &ge;20 and pnpm &ge;9. Suitable for VMs, bare-metal servers, or
            platforms that don&apos;t run Docker.
          </p>
          <pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`git clone https://github.com/vibebasket/vibebasket.git && cd vibebasket
cp .env.example .env          # fill in values (see below)
pnpm install --frozen-lockfile
pnpm run build
node scripts/catalog-sync.mjs # seed the database
pnpm --filter web start        # production server on :3000`}</pre>
        </section>

        <section id="env-vars" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <KeyRound className="h-6 w-6 text-[#e040fb]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Environment Variables
            </h2>
          </div>

          <div className="flex gap-4 p-6 border-l-2 border-[#33bbc5] bg-[#33bbc5]/5 rounded-r-[2px] mb-8">
            <Info className="h-5 w-5 text-[#33bbc5] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#33bbc5] font-semibold mb-3">
                OAuth Callback URLs
              </h4>
              <p className="text-xs text-muted-foreground/90 leading-relaxed mb-3">
                When enabling OAuth authentication, you must configure the exact redirect callback
                URL in each provider&apos;s developer console:
              </p>
              <div className="space-y-2">
                {[
                  { provider: "GitHub", path: "github" },
                  { provider: "Google", path: "google" },
                  { provider: "Apple", path: "apple" },
                  { provider: "Microsoft Entra ID", path: "microsoft-entra-id" },
                ].map((p) => (
                  <div key={p.provider} className="flex items-baseline gap-2">
                    <span className="font-mono text-[10px] text-[#bdc9c2]/60 w-28 shrink-0">
                      {p.provider}
                    </span>
                    <pre className="bg-[#0a0f0d] px-3 py-1 border border-[#3e4944] font-mono text-[10px] text-[#a0fdda] rounded-[2px] leading-relaxed">
                      {`\${NEXTAUTH_URL}/api/auth/callback/${p.path}`}
                    </pre>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#bdc9c2]/60 mt-3">
                For local development, replace{" "}
                <code className="font-mono text-[10px] text-foreground bg-card px-1 py-0.5 rounded-[2px] border border-border/50">
                  {"${NEXTAUTH_URL}"}
                </code>{" "}
                with{" "}
                <code className="font-mono text-[10px] text-foreground bg-card px-1 py-0.5 rounded-[2px] border border-border/50">
                  http://localhost:3000
                </code>
                .
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-6 border-l-2 border-amber-400 bg-amber-400/5 rounded-r-[2px] mb-8">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-[#bdc9c2] leading-relaxed">
              Never commit your{" "}
              <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                .env
              </code>{" "}
              file. The{" "}
              <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                .env
              </code>{" "}
              file is already listed in{" "}
              <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                .gitignore
              </code>
              . In Docker deployments, pass secrets as environment variables or use Docker secrets.
            </p>
          </div>

          <div className="flex gap-4 p-6 border-l-2 border-[#33bbc5] bg-[#33bbc5]/5 rounded-r-[2px] mb-8">
            <Info className="h-5 w-5 text-[#33bbc5] shrink-0 mt-0.5" />
            <p className="text-xs text-[#bdc9c2] leading-relaxed">
              If you run VibeBasket behind Cloudflare, keep application security headers enabled and
              disable script-injecting edge features for this site unless you explicitly plan for
              them. In practice that means turning off Browser Insights, Rocket Loader, and Speed
              Brain / speculative prefetch features that inject inline or third-party scripts,
              otherwise the site will log CSP violations by design.
            </p>
          </div>

          <div className="border border-[#3e4944] rounded-[2px] overflow-hidden">
            <table className="w-full border-collapse text-left text-xs leading-relaxed">
              <thead>
                <tr className="bg-[#1c211e] border-b border-[#3e4944] font-mono uppercase tracking-wider text-[10px] text-foreground">
                  <th className="p-4 pl-6 font-semibold">Variable</th>
                  <th className="p-4 font-semibold">Required</th>
                  <th className="p-4 pr-6 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3e4944] font-mono text-[#bdc9c2]">
                {[
                  {
                    name: "DATABASE_URL",
                    req: true,
                    desc: "SQLite connection string. Use file:/data/vibebasket.db for Docker (volume mount) or an absolute path for manual installs.",
                  },
                  {
                    name: "AUTH_SECRET",
                    req: true,
                    desc: "Random 32-byte secret used to sign Next-Auth session tokens. Generate with: openssl rand -base64 32",
                  },
                  {
                    name: "NEXTAUTH_URL",
                    req: true,
                    desc: "The public canonical URL of your deployment, e.g. https://vibebasket.example.com. Required for OAuth redirects.",
                  },
                  {
                    name: "AUTH_TRUST_HOST",
                    req: false,
                    desc: "Set to true when running behind a reverse proxy such as Coolify, Nginx, or Cloudflare. Strongly recommended for production OAuth callback reliability.",
                  },
                  {
                    name: "AUTH_GITHUB_ID / SECRET",
                    req: false,
                    desc: "GitHub OAuth App credentials. Set AUTH_GITHUB_ENABLED=true to enable.",
                  },
                  {
                    name: "AUTH_GOOGLE_ID / SECRET",
                    req: false,
                    desc: "Google OAuth credentials. Set AUTH_GOOGLE_ENABLED=true to enable.",
                  },
                  {
                    name: "AUTH_APPLE_ID / SECRET",
                    req: false,
                    desc: "Apple Sign-In credentials. Set AUTH_APPLE_ENABLED=true to enable.",
                  },
                  {
                    name: "AUTH_MICROSOFT_ENTRA_ID_ID / SECRET",
                    req: false,
                    desc: "Microsoft Entra ID (Azure AD) credentials. Set AUTH_MICROSOFT_ENTRA_ID_ENABLED=true. Uses /common/ endpoint by default.",
                  },
                  {
                    name: "ADMIN_OAUTH_EMAILS",
                    req: false,
                    desc: "Comma-separated list of admin emails. Access is granted only when the OAuth account email is allowlisted and verified.",
                  },
                  {
                    name: "TRUST_PROXY",
                    req: false,
                    desc: "Set to true when running behind Cloudflare, Nginx, or another trusted reverse proxy. Proxy IP headers are ignored otherwise.",
                  },
                  {
                    name: "CATALOG_REFRESH_TOKEN",
                    req: false,
                    desc: "Optional token required for authenticated production callers that use /api/catalog?refresh=1.",
                  },
                  {
                    name: "BACKUP_STORAGE_BACKEND",
                    req: false,
                    desc: "Backup storage backend: local, s3, r2, spaces, azure, or gcs. Defaults to local. Can also be set via admin panel.",
                  },
                  {
                    name: "BACKUP_S3_* / R2_* / SPACES_*",
                    req: false,
                    desc: "S3-compatible storage credentials (endpoint, region, bucket, access key, secret key). Covers AWS S3, Cloudflare R2, and DigitalOcean Spaces.",
                  },
                  {
                    name: "BACKUP_AZURE_CONNECTION_STRING / CONTAINER",
                    req: false,
                    desc: "Azure Blob Storage connection string and container name.",
                  },
                  {
                    name: "BACKUP_GCS_BUCKET / PROJECT_ID",
                    req: false,
                    desc: "Google Cloud Storage bucket name and GCP project ID.",
                  },
                ].map((v) => (
                  <tr key={v.name} className="hover:bg-[#1c211e]/40 transition-colors">
                    <td className="p-4 pl-6 text-[#a0fdda] font-semibold text-[10px]">{v.name}</td>
                    <td className="p-4 text-[10px]">
                      {v.req ? (
                        <span className="text-red-400">Required</span>
                      ) : (
                        <span className="text-[#bdc9c2]/50">Optional</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 font-sans text-[#bdc9c2]/80 leading-relaxed">
                      {v.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="bundle-ttl" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <Info className="h-6 w-6 text-[#a0fdda]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Bundle TTL & Cleanup
            </h2>
          </div>
          <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-8">
            Anonymous bundles expire after 48 hours. Registered user bundles persist for 365 days.
            The platform periodically purges expired bundles and stale session tokens.
            Administrators can trigger a manual force cleanup from the admin dashboard under System
            Health.
          </p>
          <div className="flex gap-4 p-6 border-l-2 border-[#33bbc5] bg-[#33bbc5]/5 rounded-r-[2px]">
            <Info className="h-5 w-5 text-[#33bbc5] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#33bbc5] font-semibold mb-2">
                Admin Dashboard
              </h4>
              <p className="text-xs text-muted-foreground/90 leading-relaxed">
                The admin panel at{" "}
                <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                  /admin
                </code>{" "}
                provides catalog sync controls, backup management, FTS5 index health checks,
                database integrity diagnostics, force cleanup utilities, user overview telemetry,
                and admin email configuration. Access is gated by the{" "}
                <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                  ADMIN_OAUTH_EMAILS
                </code>{" "}
                environment variable.
              </p>
            </div>
          </div>
        </section>

        <section id="helm-deployment" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <Server className="h-6 w-6 text-[#a0fdda]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Helm Deployment
            </h2>
          </div>
          <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-6">
            A Helm chart is available at{" "}
            <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              charts/vibebasket/
            </code>{" "}
            for Kubernetes deployments. The chart includes a Deployment, Service, Ingress, and
            PersistentVolumeClaim for SQLite storage.
          </p>
          <div className="border border-[#3e4944] bg-[#101412]/80 p-4 font-mono text-[11px] text-[#bdc9c2] mb-6">
            <div>
              <span className="text-[#a0fdda]">$</span> helm install vibebasket ./charts/vibebasket
              \
            </div>
            <div> --set env.NEXTAUTH_URL=https://vibebasket.example.com \</div>
            <div> --set secretEnv.AUTH_SECRET=&lt;generated-secret&gt;</div>
          </div>
          <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-4">
            The deployment uses{" "}
            <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              strategy: Recreate
            </code>{" "}
            to prevent SQLite corruption during updates. Pod{" "}
            <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              securityContext
            </code>{" "}
            runs as non-root user 1001 with all capabilities dropped. Production secrets should use{" "}
            <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              existingSecret
            </code>{" "}
            instead of embedding credentials in values.
          </p>
          <p className="text-xs text-[#bdc9c2]/70 leading-relaxed max-w-3xl">
            Before exposing a public domain, walk through the repository&apos;s production readiness
            checklist in{" "}
            <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              docs/PRODUCTION_READINESS_CHECKLIST.md
            </code>
            .
          </p>
        </section>

        <section id="wal-mode" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <AlertTriangle className="h-6 w-6 text-amber-400" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              SQLite WAL Mode
            </h2>
          </div>
          <div className="flex gap-4 p-8 border-l-2 border-amber-400 bg-amber-400/5 rounded-r-[2px]">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground/90 leading-relaxed">
                VibeBasket enables SQLite WAL (Write-Ahead Logging) mode on startup. This allows
                concurrent reads during writes and is required for the catalog sync process. Do{" "}
                <strong className="text-foreground">not</strong> mount the database file on a
                network filesystem (NFS, CIFS) — WAL locking relies on local OS primitives. If you
                run multiple Node.js replicas, use a load balancer that routes all writes to a
                single instance, or migrate to a Turso remote database.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
