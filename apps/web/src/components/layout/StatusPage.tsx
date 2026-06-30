import { ArrowLeft, ArrowRight, ShieldAlert, TriangleAlert } from "lucide-react";
import Link from "next/link";

type StatusPageAction = {
  href: string;
  label: string;
};

type StatusPageProps = {
  eyebrow: string;
  title: string;
  summary: string;
  primaryAction: StatusPageAction;
  secondaryAction?: StatusPageAction;
  tone?: "neutral" | "warning";
};

export function StatusPage({
  eyebrow,
  title,
  summary,
  primaryAction,
  secondaryAction,
  tone = "neutral",
}: StatusPageProps) {
  const accentClass = tone === "warning" ? "text-amber-300" : "text-accent";
  const borderClass =
    tone === "warning" ? "border-amber-400/30 bg-amber-400/10" : "border-accent/30 bg-accent/10";
  const Icon = tone === "warning" ? ShieldAlert : TriangleAlert;

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            VibeBasket
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Home
          </Link>
        </div>

        <section className="grid gap-8 border border-border/80 bg-card/70 p-6 lg:grid-cols-[minmax(0,1.15fr)_320px] lg:p-8">
          <div className="space-y-6">
            <div
              className={`inline-flex w-fit items-center gap-2 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${borderClass} ${accentClass}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {eyebrow}
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground">{summary}</p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 border border-border/70 bg-background/40 p-5">
            <div className="space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Next step
              </p>
              <p className="text-sm leading-7 text-foreground">
                Head back to a known route, continue browsing the catalog, or reopen the docs.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href={primaryAction.href}
                className="inline-flex h-11 items-center justify-between gap-2 border border-accent bg-accent/10 px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {primaryAction.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {secondaryAction ? (
                <Link
                  href={secondaryAction.href}
                  className="inline-flex h-11 items-center justify-between gap-2 border border-border/80 bg-background/40 px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
                >
                  {secondaryAction.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
