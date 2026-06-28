import type { EnabledAuthProvider } from "@/auth.config";
import { sanitizeCallbackUrl } from "@/lib/safe-redirect";
import { LogIn } from "lucide-react";
import Link from "next/link";

type SignInDialogProps = {
  providers: EnabledAuthProvider[];
  callbackUrl?: string;
  triggerLabel?: string;
  triggerClassName?: string;
};

function buildLoginHref(callbackUrl: string) {
  const params = new URLSearchParams();
  params.set("callbackUrl", sanitizeCallbackUrl(callbackUrl));
  return `/login?${params.toString()}`;
}

export function SignInDialog({
  providers,
  callbackUrl = "/",
  triggerLabel = "Sign in",
  triggerClassName,
}: SignInDialogProps) {
  const href = buildLoginHref(callbackUrl);

  return (
    <Link
      href={href}
      className={
        triggerClassName ??
        "inline-flex items-center gap-2 border border-accent bg-accent/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
      }
    >
      <LogIn className="h-3.5 w-3.5" />
      {triggerLabel}
    </Link>
  );
}
