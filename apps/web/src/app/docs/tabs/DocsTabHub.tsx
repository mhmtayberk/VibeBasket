import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface DocsTabHubProps {
  searchQuery: string;
  guides: {
    title: string;
    description: string;
    icon: React.ReactNode;
    linkText: string;
    tabKey: string;
    keywords: string;
  }[];
}

export function DocsTabHub({ searchQuery, guides }: DocsTabHubProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-12 flex items-center gap-2 select-none">
        <span className="opacity-80">Docs</span>
        <span className="text-[#bdc9c2]/30">/</span>
        <span className="text-foreground">Architectural Hub</span>
      </div>

      <div className="mb-24">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#a0fdda] border border-[#a0fdda]/20 bg-[#a0fdda]/5 px-4 py-2 rounded-[2px] inline-block mb-8 select-none">
          VibeBasket Technical Specs
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
          Documentation Hub
        </h1>
        <p className="text-base sm:text-lg text-[#bdc9c2] max-w-3xl leading-relaxed">
          Everything you need to configure, run, and scale reproducible developer contexts. Explore
          our guides, command-line arguments, and local security configurations.
        </p>
      </div>

      {guides.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-mono text-sm text-[#bdc9c2]/60">
            No results for &ldquo;<span className="text-[#a0fdda]">{searchQuery}</span>&rdquo;. Try
            a different keyword.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-14 mb-44">
          {guides.map((guide) => (
            <Link
              key={guide.title}
              href={`/docs?tab=${guide.tabKey}`}
              className="group relative bg-[#181d1a] border border-[#3e4944] p-10 hover:border-[#a0fdda] hover:bg-[#202622] hover:shadow-[0_0_30px_rgba(160,253,218,0.18)] hover:-translate-y-1.5 active:scale-[0.97] transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer rounded-[2px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#a0fdda]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="mb-8 w-12 h-12 rounded-[2px] border border-[#3e4944] bg-[#101412] flex items-center justify-center group-hover:border-[#a0fdda]/70 group-hover:bg-[#a0fdda]/10 transition-all shrink-0">
                {guide.icon}
              </div>
              <h3 className="text-base font-semibold text-foreground mb-4 group-hover:text-[#a0fdda] transition-colors">
                {guide.title}
              </h3>
              <p className="text-xs text-[#bdc9c2] leading-relaxed flex-1">{guide.description}</p>
              <div className="mt-8 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#a0fdda] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-6px] group-hover:translate-x-1.5">
                {guide.linkText}
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
