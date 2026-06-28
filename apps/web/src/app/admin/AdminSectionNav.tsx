import Link from "next/link";

export type AdminSectionLink = {
  id: string;
  label: string;
};

type AdminSectionNavProps = {
  sections: AdminSectionLink[];
};

export function AdminSectionNav({ sections }: AdminSectionNavProps) {
  return (
    <nav
      aria-label="Admin sections"
      className="sticky top-[73px] z-30 -mx-4 mb-8 border-y border-border/80 bg-background/90 px-4 py-3 backdrop-blur-md sm:top-[81px] sm:mx-0 sm:px-0"
    >
      <div className="overflow-x-auto">
        <div className="flex min-w-max items-center gap-2">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`#${section.id}`}
              className="inline-flex h-10 items-center border border-border/70 bg-card/70 px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground sm:text-[11px] sm:tracking-[0.18em]"
            >
              {section.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
