import Link from "next/link";
import { AlertTriangle, Info, KeyRound, Server, TerminalSquare } from "lucide-react";

export function DocsTabSelfHosting() {
	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
			<div className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-12 flex items-center gap-2 select-none">
				<Link href="/docs" className="opacity-80 hover:text-[#a0fdda] transition-colors cursor-pointer">Docs</Link>
				<span className="text-[#bdc9c2]/30">/</span>
				<span className="text-foreground">Self-hosting</span>
			</div>

			<div className="mb-24">
				<h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
					Self-Hosting Guide
				</h1>
				<p className="text-base sm:text-lg text-[#bdc9c2] max-w-3xl leading-relaxed">
					Configure local database servers, secure API reverse proxies, and gate access roles.
				</p>
			</div>

			<div className="space-y-28 border-t border-[#3e4944]/50 pt-20">
				<section id="docker" className="scroll-mt-28">
					<div className="flex items-center gap-2.5 mb-8">
						<Server className="h-6 w-6 text-[#a0fdda]" />
						<h2 className="text-2xl font-semibold tracking-tight text-foreground">Docker (recommended)</h2>
					</div>
					<p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-8">
						The easiest way to self-host VibeBasket. The image is a lean multi-stage build based on Node.js 22 Alpine.
						The SQLite database file is persisted through a named Docker volume so your data survives container restarts and upgrades.
					</p>

					<div className="space-y-10">
						<div>
							<p className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-3">Step 1 — Clone &amp; configure</p>
							<pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`git clone https://github.com/your-org/vibebasket.git
cd vibebasket

# Copy the example env file and fill in your values
cp .env.example .env`}</pre>
						</div>

						<div>
							<p className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-3">Step 2 — Start with Docker Compose</p>
							<pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`docker compose up -d

# View logs
docker compose logs -f web`}</pre>
						</div>

						<div>
							<p className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-3">Step 3 — Seed the catalog</p>
							<pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`# Run the catalog sync inside the running container
docker compose exec web node scripts/catalog-sync.mjs`}</pre>
						</div>

						<div>
							<p className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-3">Upgrading</p>
							<pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`git pull
docker compose up -d --build`}</pre>
						</div>
					</div>
				</section>

				<section id="manual" className="scroll-mt-28">
					<div className="flex items-center gap-2.5 mb-8">
						<TerminalSquare className="h-6 w-6 text-[#33bbc5]" />
						<h2 className="text-2xl font-semibold tracking-tight text-foreground">Manual Installation</h2>
					</div>
					<p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-8">
						Requires Node.js &ge;20 and pnpm &ge;9. Suitable for VMs, bare-metal servers, or platforms that don&apos;t run Docker.
					</p>
					<pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`git clone https://github.com/your-org/vibebasket.git && cd vibebasket
cp .env.example .env          # fill in values (see below)
pnpm install --frozen-lockfile
pnpm run build
node scripts/catalog-sync.mjs # seed the database
pnpm --filter web start        # production server on :3000`}</pre>
				</section>

				<section id="env-vars" className="scroll-mt-28">
					<div className="flex items-center gap-2.5 mb-8">
						<KeyRound className="h-6 w-6 text-[#e040fb]" />
						<h2 className="text-2xl font-semibold tracking-tight text-foreground">Environment Variables</h2>
					</div>

					<div className="flex gap-4 p-6 border-l-2 border-[#33bbc5] bg-[#33bbc5]/5 rounded-r-[2px] mb-8">
						<Info className="h-5.5 w-5.5 text-[#33bbc5] shrink-0 mt-0.5" />
						<div>
							<h4 className="font-mono text-[11px] uppercase tracking-widest text-[#33bbc5] font-semibold mb-3">
								GitHub OAuth Callback URL
							</h4>
							<p className="text-xs text-muted-foreground/90 leading-relaxed mb-3">
								When enabling GitHub authentication, you must configure the exact redirect callback URL in your GitHub Developer Application settings:
							</p>
							<pre className="bg-[#0a0f0d] p-4 border border-[#3e4944] font-mono text-[11px] text-[#a0fdda] overflow-x-auto rounded-[2px] leading-relaxed">
								{"${NEXTAUTH_URL}/api/auth/callback/github"}
							</pre>
							<p className="text-[10px] text-[#bdc9c2]/60 mt-3">
								For local development, this defaults to <code className="font-mono text-[10px] text-foreground bg-card px-1 py-0.5 rounded-[2px] border border-border/50">http://localhost:3000/api/auth/callback/github</code>.
							</p>
						</div>
					</div>

					<div className="flex gap-4 p-6 border-l-2 border-amber-400 bg-amber-400/5 rounded-r-[2px] mb-8">

						<AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
						<p className="text-xs text-[#bdc9c2] leading-relaxed">
							Never commit your <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">.env</code> file.
							The <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">.env</code> file is already listed in <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">.gitignore</code>.
							In Docker deployments, pass secrets as environment variables or use Docker secrets.
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
									{ name: "DATABASE_URL", req: true, desc: 'SQLite connection string. Use file:/data/vibebasket.db for Docker (volume mount) or an absolute path for manual installs.' },
									{ name: "AUTH_SECRET", req: true, desc: 'Random 32-byte secret used to sign Next-Auth session tokens. Generate with: openssl rand -base64 32' },
									{ name: "NEXTAUTH_URL", req: true, desc: 'The public canonical URL of your deployment, e.g. https://vibebasket.example.com. Required for OAuth redirects.' },
									{ name: "AUTH_TRUST_HOST", req: false, desc: 'Set to true when running behind a reverse proxy. Required for OAuth callbacks to work correctly in production.' },
									{ name: "AUTH_GITHUB_ID / SECRET", req: false, desc: 'GitHub OAuth App credentials. Set AUTH_GITHUB_ENABLED=true to enable.' },
									{ name: "AUTH_GOOGLE_ID / SECRET", req: false, desc: 'Google OAuth credentials. Set AUTH_GOOGLE_ENABLED=true to enable.' },
									{ name: "AUTH_APPLE_ID / SECRET", req: false, desc: 'Apple Sign-In credentials. Set AUTH_APPLE_ENABLED=true to enable.' },
									{ name: "AUTH_MICROSOFT_ENTRA_ID_ID / SECRET", req: false, desc: 'Microsoft Entra ID (Azure AD) credentials. Set AUTH_MICROSOFT_ENTRA_ID_ENABLED=true. Uses /common/ endpoint by default.' },
									{ name: "ADMIN_OAUTH_EMAILS", req: false, desc: 'Comma-separated list of verified account emails that can access the /admin dashboard.' },
									{ name: "TRUST_PROXY", req: false, desc: 'Set to true when running behind Cloudflare, Nginx, or any reverse proxy. Enables correct IP extraction for rate limiting.' },
									{ name: "BACKUP_STORAGE_BACKEND", req: false, desc: 'Backup storage backend: local, s3, r2, spaces, azure, or gcs. Defaults to local. Can also be set via admin panel.' },
									{ name: "BACKUP_S3_* / R2_* / SPACES_*", req: false, desc: 'S3-compatible storage credentials (endpoint, region, bucket, access key, secret key). Covers AWS S3, Cloudflare R2, and DigitalOcean Spaces.' },
									{ name: "BACKUP_AZURE_CONNECTION_STRING / CONTAINER", req: false, desc: 'Azure Blob Storage connection string and container name.' },
									{ name: "BACKUP_GCS_BUCKET / PROJECT_ID", req: false, desc: 'Google Cloud Storage bucket name and GCP project ID.' },
								].map((v) => (
									<tr key={v.name} className="hover:bg-[#1c211e]/40 transition-colors">
										<td className="p-4 pl-6 text-[#a0fdda] font-semibold text-[10px]">{v.name}</td>
										<td className="p-4 text-[10px]">
											{v.req
												? <span className="text-red-400">Required</span>
												: <span className="text-[#bdc9c2]/50">Optional</span>}
										</td>
										<td className="p-4 pr-6 font-sans text-[#bdc9c2]/80 leading-relaxed">{v.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>

				<section id="concurrency" className="scroll-mt-28">
					<div className="flex gap-4 p-8 border-l-2 border-amber-400 bg-amber-400/5 rounded-r-[2px]">
						<AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
						<div>
							<h4 className="font-mono text-[11px] uppercase tracking-widest text-amber-400 font-semibold mb-3">SQLite WAL Mode</h4>
							<p className="text-xs text-muted-foreground/90 leading-relaxed">
								VibeBasket enables SQLite WAL (Write-Ahead Logging) mode on startup. This allows concurrent reads during writes and is required for the catalog sync process.
								Do <strong className="text-foreground">not</strong> mount the database file on a network filesystem (NFS, CIFS) — WAL locking relies on local OS primitives.
								If you run multiple Node.js replicas, use a load balancer that routes all writes to a single instance, or migrate to a Turso remote database.
							</p>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
