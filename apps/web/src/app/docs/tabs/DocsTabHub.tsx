import type { AppLocale } from "@/i18n/config";
import { localizePath } from "@/i18n/locale-routing";
import { ArrowRight, ArrowUpRight, Package2 } from "lucide-react";
import Link from "next/link";

interface DocsTabHubProps {
  locale: AppLocale;
  searchQuery: string;
  guides: {
    title: string;
    description: string;
    icon: React.ReactNode;
    linkText: string;
    tabKey: string;
    keywords: string;
  }[];
  shell: {
    docsHome: string;
    architecturalHub: string;
    technicalSpecs: string;
    documentationHub: string;
    hubDescription: string;
    githubRepository: string;
    npmPackage: string;
    noResults: string;
    tryDifferentKeyword: string;
  };
}

export function DocsTabHub({ locale, searchQuery, guides, shell }: DocsTabHubProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-12 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] select-none">
        <span className="opacity-80">{shell.docsHome}</span>
        <span className="text-[#bdc9c2]/30">/</span>
        <span className="text-foreground">{shell.architecturalHub}</span>
      </div>

      <div className="mb-24">
        <span className="mb-8 inline-block max-w-full rounded-[2px] border border-[#a0fdda]/20 bg-[#a0fdda]/5 px-4 py-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.22em] text-[#a0fdda] select-none">
          {shell.technicalSpecs}
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
          {shell.documentationHub}
        </h1>
        <p className="text-base sm:text-lg text-[#bdc9c2] max-w-3xl leading-relaxed">
          {shell.hubDescription}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="https://github.com/mhmtayberk/VibeBasket"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 max-w-full items-center gap-2 border border-[#3e4944] bg-[#181d1a] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#bdc9c2] transition-colors hover:border-[#a0fdda]/50 hover:text-[#f4fbf7]"
          >
            <ArrowUpRight className="h-3.5 w-3.5 text-[#a0fdda]" />
            {shell.githubRepository}
          </Link>
          <Link
            href="https://www.npmjs.com/package/vibebasket"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 max-w-full items-center gap-2 border border-[#3e4944] bg-[#181d1a] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#bdc9c2] transition-colors hover:border-[#a0fdda]/50 hover:text-[#f4fbf7]"
          >
            <Package2 className="h-3.5 w-3.5 text-[#a0fdda]" />
            {shell.npmPackage}
          </Link>
        </div>
      </div>

      {guides.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-mono text-sm text-[#bdc9c2]/60">
            {shell.noResults} &ldquo;<span className="text-[#a0fdda]">{searchQuery}</span>&rdquo;.{" "}
            {shell.tryDifferentKeyword}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-14 mb-44">
          {guides.map((guide) => (
            <Link
              key={guide.title}
              href={`${localizePath(locale, "/docs")}?tab=${guide.tabKey}`}
              className="group relative flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-[2px] border border-[#3e4944] bg-[#181d1a] p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#a0fdda] hover:bg-[#202622] hover:shadow-[0_0_30px_rgba(160,253,218,0.18)] active:scale-[0.97] sm:p-10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#a0fdda]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="mb-8 w-12 h-12 rounded-[2px] border border-[#3e4944] bg-[#101412] flex items-center justify-center group-hover:border-[#a0fdda]/70 group-hover:bg-[#a0fdda]/10 transition-all shrink-0">
                {guide.icon}
              </div>
              <h3 className="mb-4 break-words text-base font-semibold text-foreground transition-colors group-hover:text-[#a0fdda]">
                {guide.title}
              </h3>
              <p className="flex-1 break-words text-xs leading-relaxed text-[#bdc9c2]">
                {guide.description}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#a0fdda] opacity-0 transition-all duration-300 translate-x-[-6px] group-hover:translate-x-1.5 group-hover:opacity-100">
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
