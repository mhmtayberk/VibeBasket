"use client";

import { type AppLocale, SUPPORTED_LOCALES } from "@/i18n/config";
import { localizePath, stripLocaleFromPathname } from "@/i18n/locale-routing";
import { Check, ChevronDown, Languages } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type LocaleSwitcherProps = {
  locale: AppLocale;
  label: string;
  localeLabels: Record<AppLocale, string>;
};

const localeNames: Record<AppLocale, string> = {
  en: "English",
  tr: "Türkçe",
  es: "Español",
  zh: "简体中文",
  hi: "हिन्दी",
  ru: "Русский",
};

export function LocaleSwitcher({ locale, label, localeLabels }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const basePath = stripLocaleFromPathname(pathname);
  const currentLocaleLabel = localeLabels[locale] ?? locale.toUpperCase();
  const detailsRef = useRef<HTMLDetailsElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = useCallback(() => {
    if (detailsRef.current) {
      detailsRef.current.open = false;
      detailsRef.current.removeAttribute("open");
    }
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!detailsRef.current) {
      return;
    }

    closeMenu();
  }, [closeMenu]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("keydown", handleEscape, true);

    return () => {
      document.removeEventListener("keydown", handleEscape, true);
    };
  }, [closeMenu]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!detailsRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    }

    window.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [closeMenu, isOpen]);

  return (
    <details
      ref={detailsRef}
      className="relative"
      open={isOpen}
      onKeyDownCapture={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          closeMenu();
        }
      }}
    >
      <summary
        onClick={(event) => {
          event.preventDefault();
          setIsOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeMenu();
          }
        }}
        className={`flex h-9 min-w-[4.5rem] list-none items-center justify-between gap-1.5 border px-2.5 transition-colors cursor-pointer [&::-webkit-details-marker]:hidden ${
          isOpen
            ? "border-accent/60 bg-card text-foreground"
            : "border-border/80 bg-card/70 text-muted-foreground hover:border-accent/40 hover:text-foreground"
        }`}
        aria-label={label}
        title={label}
      >
        <div className="flex items-center gap-1.5">
          <Languages className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="min-w-[1.5rem] text-center text-[11px] font-semibold leading-none">
            {currentLocaleLabel}
          </span>
        </div>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180 text-accent" : ""}`}
          aria-hidden="true"
        />
      </summary>

      <div className="absolute right-0 top-full z-50 min-w-[10.5rem] pt-2">
        <div className="border border-border/80 bg-card/95 p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.42)] backdrop-blur-md">
          <div className="px-2 py-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/70">
              {label}
            </span>
          </div>

          <div className="mt-1 space-y-1">
            {SUPPORTED_LOCALES.map((candidate) => {
              const href = `${localizePath(candidate, basePath)}${search ? `?${search}` : ""}`;
              const isActive = candidate === locale;

              return (
                <Link
                  key={candidate}
                  href={href}
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center justify-between gap-3 border px-3 py-2 transition-colors ${
                    isActive
                      ? "border-accent/60 bg-accent/10 text-accent"
                      : "border-transparent text-muted-foreground hover:border-accent/30 hover:bg-background/50 hover:text-foreground"
                  }`}
                  onClick={() => {
                    closeMenu();
                  }}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                    {localeLabels[candidate]}
                  </span>
                  <span className="min-w-0 truncate text-sm">{localeNames[candidate]}</span>
                  <Check
                    className={`h-3.5 w-3.5 shrink-0 ${isActive ? "opacity-100" : "opacity-0"}`}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </details>
  );
}
