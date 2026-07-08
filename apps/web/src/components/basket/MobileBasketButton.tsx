"use client";

import type { EnabledAuthProvider } from "@/auth.config";
import type { AppDictionary } from "@/i18n/dictionaries/en";
import { cn } from "@/lib/utils";
import { ShoppingBasket } from "lucide-react";
import { useEffect, useState } from "react";
import { BasketPanel } from "./BasketPanel";

interface MobileBasketButtonProps {
  isSignedIn?: boolean;
  enabledProviders?: EnabledAuthProvider[];
  userRole?: string;
  className?: string;
  copy: AppDictionary["basketUi"];
}

export function MobileBasketButton({
  isSignedIn,
  enabledProviders,
  userRole,
  className,
  copy,
}: MobileBasketButtonProps) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    const onResize = () => check();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!isMobile) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)] right-4 z-50 flex h-12 w-12 items-center justify-center border border-accent bg-accent text-accent-foreground shadow-lg transition-transform active:scale-95 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14",
          open && "opacity-0 pointer-events-none",
          className,
        )}
        aria-label={copy.title}
      >
        <ShoppingBasket className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm">
          <BasketPanel
            variant="modal"
            onClose={() => setOpen(false)}
            isSignedIn={isSignedIn}
            enabledProviders={enabledProviders}
            userRole={userRole}
            className="h-full w-full rounded-none border-none"
            copy={copy}
          />
        </div>
      )}
    </>
  );
}
