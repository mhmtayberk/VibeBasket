import { redirect } from "next/navigation";
import { ArrowLeft, Layers3, ShieldCheck } from "lucide-react";
import { auth, getEnabledAuthProviders } from "@/auth";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { SavedStacksPanel } from "@/components/stacks/SavedStacksPanel";

export const dynamic = "force-dynamic";

export default async function StacksPage() {
  const session = await auth();
  const enabledProviders = getEnabledAuthProviders();

  if (!session?.user && enabledProviders.length === 0) {
    redirect("/");
  }

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col gap-6 border border-border/80 bg-card/80 p-8">
          <div className="inline-flex w-fit items-center gap-2 border border-border/70 bg-background/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
            <ShieldCheck className="h-3.5 w-3.5" />
            Authentication required
          </div>
          <h1 className="text-3xl font-semibold">Sign in to access saved stacks</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            Saved stacks live on your profile, so this area is only available after authentication.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <SignInDialog providers={enabledProviders} callbackUrl="/stacks" />
            <a
              href="/"
              className="inline-flex items-center gap-2 border border-border/80 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to catalog
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <a
          href="/"
          className="inline-flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to builder
        </a>

        <section className="border border-border/80 bg-card/80 p-8">
          <div className="inline-flex w-fit items-center gap-2 border border-border/70 bg-background/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
            <Layers3 className="h-3.5 w-3.5" />
            Saved stacks
          </div>
          <h1 className="mt-5 text-3xl font-semibold">Your saved stacks</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Reopen baskets you use often, rename them as your workflow evolves, or remove stale setups when they are no longer useful.
          </p>

          <SavedStacksPanel className="mt-8" enabled={true} />
        </section>
      </div>
    </main>
  );
}
