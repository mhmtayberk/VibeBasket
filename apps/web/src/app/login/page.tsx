import { auth, getEnabledAuthProviders } from "@/auth";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { sanitizeCallbackUrl } from "@/lib/safe-redirect";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [session, resolvedSearchParams] = await Promise.all([auth(), searchParams]);
  const callbackUrl = sanitizeCallbackUrl(resolvedSearchParams?.callbackUrl);

  if (session?.user) {
    redirect(callbackUrl);
  }

  const providers = getEnabledAuthProviders();

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            VibeBasket
          </Link>
          <Link
            href={callbackUrl}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
          >
            Back
          </Link>
        </div>

        <section className="grid gap-8 border border-border/80 bg-card/70 p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
          <div className="space-y-6">
            <div className="inline-flex w-fit items-center gap-2 border border-border/70 bg-background/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
              <ShieldCheck className="h-3.5 w-3.5" />
              Account sync
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Sign in to save your stacks
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                Keep your favorite baskets tied to your profile so you can reopen them, share them,
                and reuse them across sessions.
              </p>
            </div>

            <div className="grid gap-3 border border-border/60 bg-background/30 p-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Profile sync
                </p>
                <p className="text-sm text-foreground">
                  Saved stacks stay attached to your account.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Provider choice
                </p>
                <p className="text-sm text-foreground">
                  Only the providers enabled in this environment appear.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Safe return
                </p>
                <p className="text-sm text-foreground">
                  After sign-in, you land back on the flow you started from.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-border/70 bg-background/40 p-5">
            {providers.length > 0 ? (
              <div className="space-y-4">
                <AuthButtons providers={providers} callbackUrl={callbackUrl} />
                <p className="text-xs leading-6 text-muted-foreground">
                  Self-hosted deployments can enable or disable each provider independently.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Login is not configured yet.</p>
                <p className="text-xs leading-6 text-muted-foreground">
                  No social auth provider is enabled in this environment right now. Add provider
                  credentials and an <code>AUTH_SECRET</code> to turn sign-in on.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
