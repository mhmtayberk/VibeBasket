"use client";

import { useEffect, useState } from "react";

type HealthTone = "healthy" | "warning" | "critical";

interface ReleaseReadinessItem {
  key: string;
  label: string;
  tone: HealthTone;
  detail: string;
}

interface ReleaseReadinessReport {
  tone: HealthTone;
  blockers: ReleaseReadinessItem[];
  warnings: ReleaseReadinessItem[];
  checks: ReleaseReadinessItem[];
}

const toneClasses: Record<HealthTone, string> = {
  healthy: "border-accent/30 bg-accent/10 text-accent",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  critical: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function ReleaseReadinessPanel() {
  const [report, setReport] = useState<ReleaseReadinessReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/release-readiness", { cache: "no-store" })
      .then((response) => response.json())
      .then((result: { success: boolean; report?: ReleaseReadinessReport; error?: string }) => {
        if (result.success && result.report) {
          setReport(result.report);
          setError(null);
          return;
        }

        setError(result.error ?? "Failed to load release readiness.");
      })
      .catch(() => {
        setError("Failed to load release readiness.");
      });
  }, []);

  return (
    <section className="mb-8 border border-border/80 bg-card/70 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            Release Readiness
          </div>
          <h2 className="mt-2 text-xl font-semibold text-foreground">
            Prod blockers and deploy-time warnings
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            This is a lightweight preflight view over auth, backup, storage, and catalog refresh
            configuration so broken deploys are visible before launch day.
          </p>
        </div>
        <span
          className={`inline-flex h-fit items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${
            report
              ? toneClasses[report.tone]
              : "border-border/70 bg-background/50 text-muted-foreground"
          }`}
        >
          {report ? report.tone : "loading"}
        </span>
      </div>

      {error ? (
        <div className="mt-6 border border-destructive/30 bg-destructive/10 p-4 text-sm text-muted-foreground">
          {error}
        </div>
      ) : null}

      {report ? (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="border border-border/70 bg-background/40 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Blockers
              </div>
              <div className="mt-2 text-3xl font-bold text-foreground">
                {report.blockers.length}
              </div>
            </div>
            <div className="border border-border/70 bg-background/40 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Warnings
              </div>
              <div className="mt-2 text-3xl font-bold text-foreground">
                {report.warnings.length}
              </div>
            </div>
            <div className="border border-border/70 bg-background/40 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Passing Checks
              </div>
              <div className="mt-2 text-3xl font-bold text-foreground">{report.checks.length}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="space-y-3">
              {report.blockers.length === 0 && report.warnings.length === 0 ? (
                <div className="border border-accent/30 bg-accent/10 p-4 text-sm text-accent">
                  No immediate prod blockers detected from the current runtime configuration.
                </div>
              ) : null}

              {report.blockers.map((item) => (
                <div key={item.key} className="border border-destructive/30 bg-destructive/10 p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-destructive">
                      Blocker
                    </span>
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              ))}

              {report.warnings.map((item) => (
                <div key={item.key} className="border border-amber-400/30 bg-amber-400/10 p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-300">
                      Warning
                    </span>
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="border border-border/70 bg-background/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                  Passing Checks
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Current runtime
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {report.checks.map((item) => (
                  <div key={item.key} className="border border-border/70 bg-card/70 p-3">
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6 border border-border/70 bg-background/40 p-4 text-sm text-muted-foreground">
          Loading release readiness...
        </div>
      )}
    </section>
  );
}
