import { Button } from "@/components/ui/button";
import { BadgeCheck, Zap, Lock } from "lucide-react";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { FloatingBasket } from "@/components/basket/FloatingBasket";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-20 bg-background text-foreground relative overflow-hidden">
      {/* Subtle background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl w-full flex flex-col items-center text-center space-y-12 z-10">
        
        {/* 1. Hero Headline */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50 text-sm font-medium mb-4">
            <Zap className="w-4 h-4 text-accent" />
            <span>Ninite for Vibe Coding</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent px-2">
            Bundle your AI dev setup.
          </h1>
        </div>

        {/* 2. Short Description */}
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto px-4">
          Select MCP servers, Claude Skills, Rules files, and Workflow Packs. 
          Get a single command to configure Cursor, Windsurf, VS Code and more.
        </p>

        {/* 4. CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
          <Button size="lg" className="w-full sm:w-auto rounded-full bg-accent text-accent-foreground hover:bg-accent/90 px-8 h-12 text-base font-medium shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            Build your basket
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-border/50 hover:bg-secondary/50 px-8 h-12 text-base font-medium">
            Browse catalog
          </Button>
        </div>

        {/* 3. Benefit bullets */}
        <div className="grid md:grid-cols-3 gap-8 pt-16 mt-8 border-t border-border/30 w-full text-left">
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
