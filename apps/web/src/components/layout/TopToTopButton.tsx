"use client";

import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function TopToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 500);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] left-4 z-40 inline-flex h-10 w-10 items-center justify-center border border-border/80 bg-card/88 text-muted-foreground backdrop-blur-sm transition-all hover:border-accent/60 hover:text-foreground sm:bottom-5 sm:left-auto sm:right-5 sm:h-11 sm:w-11 lg:bottom-5",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
