"use client";

import type { EnabledAuthProvider } from "@/auth.config";
import { AuthButtons } from "@/components/auth/AuthButtons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LogIn, ShieldCheck } from "lucide-react";
import { useState } from "react";

type SignInDialogProps = {
  providers: EnabledAuthProvider[];
  callbackUrl?: string;
  triggerLabel?: string;
  triggerClassName?: string;
};

export function SignInDialog({
  providers,
  callbackUrl = "/",
  triggerLabel = "Sign in",
  triggerClassName,
}: SignInDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={
          triggerClassName ??
          "inline-flex items-center gap-2 border border-accent bg-accent/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
        }
      >
        <LogIn className="h-3.5 w-3.5" />
        {triggerLabel}
      </DialogTrigger>

      <DialogContent className="max-w-md border border-border/80 bg-card/95 p-0 text-foreground ring-0">
        <DialogHeader className="border-b border-border/70 px-5 py-5">
          <div className="inline-flex w-fit items-center gap-2 border border-border/70 bg-background/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
            <ShieldCheck className="h-3.5 w-3.5" />
            Account sync
          </div>
          <DialogTitle className="pt-3 text-xl font-semibold">
            Sign in to save your stacks
          </DialogTitle>
          <DialogDescription className="max-w-sm text-sm leading-6 text-muted-foreground">
            Keep your favorite baskets tied to your profile so you can reopen and reuse them across
            sessions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-5">
          {providers.length > 0 ? (
            <>
              <AuthButtons providers={providers} callbackUrl={callbackUrl} />
              <p className="text-xs leading-5 text-muted-foreground">
                Only enabled providers are shown. Self-hosted deployments can turn each one on or
                off independently.
              </p>
            </>
          ) : (
            <div className="space-y-3 border border-border/60 bg-background/30 p-4">
              <p className="text-sm font-medium text-foreground">Login is not configured yet.</p>
              <p className="text-xs leading-6 text-muted-foreground">
                No social auth provider is enabled in this environment right now. Add provider
                credentials and an `AUTH_SECRET` to turn sign-in on.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
