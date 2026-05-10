import { Button } from "@/components/ui/button";
import { BadgeCheck, Zap, Lock } from "lucide-react";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { FloatingBasket } from "@/components/basket/FloatingBasket";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 sm:p-20 bg-background text-foreground relative overflow-hidden">
      {/* Subtle background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl w-full flex flex-col items-center text-center space-y-12 z-10">
        
        {/* 1. Hero Headline */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50 text-sm font-medium mb-4">
            <Zap className="w-4 h-4 text-accent" />
            <span>Ninite for Vibe Coding</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white drop-shadow-sm">
            Bundle your AI dev setup.<br />
            <span className="text-muted-foreground">One link. All IDEs.</span>
          </h1>
        </div>

        {/* 2. Short Description */}
        <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
          Select MCP servers, Claude Skills, Rules files, and Workflow Packs. 
          Get a single command to configure Cursor, Windsurf, VS Code and more.
        </p>

        {/* 4. CTA */}
        <div className="flex flex-col sm:flex-row gap-4 items-center pt-4">
          <Button size="lg" className="h-14 px-8 text-lg bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            Build your basket
          </Button>
          <a href="#catalog" className="inline-flex items-center justify-center whitespace-nowrap outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 border h-14 px-8 text-lg rounded-xl border-border bg-background hover:bg-secondary/50 text-white font-medium transition-all">
            Browse catalog
          </a>
        </div>

        {/* 3. Benefit bullets */}
        <div className="grid sm:grid-cols-3 gap-8 pt-16 mt-8 border-t border-border/30 w-full text-left">
          <div className="flex flex-col items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center border border-border/50">
              <BadgeCheck className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold text-white">Idempotent Applier</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Never corrupts existing configurations. Always merges safely with timestamped backups.
            </p>
          </div>
          
          <div className="flex flex-col items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center border border-border/50">
              <Lock className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold text-white">Secure Secrets</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Secrets never leave your machine. Prompts locally during the CLI execution.
            </p>
          </div>
          
          <div className="flex flex-col items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center border border-border/50">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold text-white">Shareable Bundles</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Share your perfect toolchain setup with the team via a single anonymous URL.
            </p>
          </div>
        </div>

      </div>

      <div id="catalog" className="w-full mt-24">
        <CatalogGrid />
      </div>

      <FloatingBasket />
    </main>
  );
}
