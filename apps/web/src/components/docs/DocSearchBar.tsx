"use client";

import type { AppLocale } from "@/i18n/config";
import { localizePath } from "@/i18n/locale-routing";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface DocSearchBarProps {
  initialQuery: string;
  locale: AppLocale;
  placeholder: string;
  ariaLabel: string;
}

export function DocSearchBar({ initialQuery, locale, placeholder, ariaLabel }: DocSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local state in sync when the URL changes externally (e.g. sidebar nav)
  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setValue(q);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());

        // Search always lands on the hub tab where results are shown
        params.set("tab", "hub");

        if (q.trim()) {
          params.set("q", q.trim());
        } else {
          params.delete("q");
        }

        router.push(`${localizePath(locale, "/docs")}?${params.toString()}`, { scroll: false });
      }, 300);
    },
    [locale, router, searchParams],
  );

  // Clear on Escape
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setValue("");
        const params = new URLSearchParams(searchParams.toString());
        params.delete("q");
        router.push(`${localizePath(locale, "/docs")}?${params.toString()}`, { scroll: false });
      }
    },
    [locale, router, searchParams],
  );

  return (
    <div className="hidden min-w-0 items-center border border-[#3e4944] rounded-[2px] bg-[#181d1a]/50 px-4 py-2 transition-all focus-within:border-[#a0fdda] focus-within:ring-1 focus-within:ring-[#a0fdda]/25 md:flex md:w-56 xl:w-64">
      <Search className="h-4 w-4 text-[#bdc9c2] mr-2 shrink-0" />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="bg-transparent border-none p-0 text-xs font-mono focus:ring-0 text-foreground placeholder:text-[#bdc9c2]/50 w-full focus:outline-none"
      />
    </div>
  );
}
