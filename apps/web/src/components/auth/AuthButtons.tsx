import Link from "next/link";
import { ArrowRight, Code2, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnabledAuthProvider } from "@/auth.config";

type AuthButtonsProps = {
  providers: EnabledAuthProvider[];
  callbackUrl?: string;
  className?: string;
};

function getProviderIcon(providerId: EnabledAuthProvider["id"]) {
  switch (providerId) {
    case "github":
      return <Code2 className="h-4 w-4" />;
    case "google":
      return <Globe className="h-4 w-4" />;
    case "apple":
      return <Lock className="h-4 w-4" />;
  }
}

export function AuthButtons({
  providers,
  callbackUrl = "/",
  className,
}: AuthButtonsProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      {providers.map((provider) => (
        <Link
          key={provider.id}
          href={`/api/auth/signin/${provider.id}?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="inline-flex min-h-11 items-center justify-between gap-3 border border-border/70 bg-background/50 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/50 hover:bg-accent/5"
        >
          <span className="inline-flex items-center gap-3">
            {getProviderIcon(provider.id)}
            <span>Continue with {provider.label}</span>
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      ))}
    </div>
  );
}
