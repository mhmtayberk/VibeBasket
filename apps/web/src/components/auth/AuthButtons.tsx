import { signIn } from "@/auth";
import type { EnabledAuthProvider } from "@/auth.config";
import { sanitizeCallbackUrl } from "@/lib/safe-redirect";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { SVGProps } from "react";

type AuthButtonsProps = {
  providers: EnabledAuthProvider[];
  callbackUrl?: string;
  className?: string;
};

type ProviderIconProps = SVGProps<SVGSVGElement> & {
  title: string;
};

function getProviderIcon(providerId: EnabledAuthProvider["id"]) {
  switch (providerId) {
    case "github":
      return (
        <GitHubProviderIcon
          className="h-[18px] w-[18px] text-foreground"
          aria-hidden="true"
          title="GitHub"
        />
      );
    case "google":
      return (
        <GoogleProviderIcon
          className="h-[18px] w-[18px] text-foreground"
          aria-hidden="true"
          title="Google"
        />
      );
    case "apple":
      return (
        <AppleProviderIcon
          className="h-[18px] w-[18px] text-foreground"
          aria-hidden="true"
          title="Apple"
        />
      );
    case "microsoft-entra-id":
      return (
        <MicrosoftProviderIcon
          className="h-[18px] w-[18px] text-foreground"
          aria-hidden="true"
          title="Microsoft"
        />
      );
  }
}

function ProviderIconBase({
  className,
  title,
  viewBox,
  children,
  ...props
}: ProviderIconProps & { viewBox: string }) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <title>{title}</title>
      {children}
    </svg>
  );
}

function GitHubProviderIcon(props: ProviderIconProps) {
  return (
    <ProviderIconBase viewBox="0 0 30 30" {...props}>
      <path
        fill="currentColor"
        d="M15 3C8.373 3 3 8.373 3 15c0 5.623 3.872 10.328 9.092 11.63-.056-.162-.092-.35-.092-.583v-2.051c-.487 0-1.303 0-1.508 0-.821 0-1.551-.353-1.905-1.009-.393-.729-.461-1.844-1.435-2.526-.289-.227-.069-.486.264-.451.615.174 1.125.596 1.605 1.222.478.627.703.769 1.596.769.433 0 1.081-.025 1.691-.121.328-.833.895-1.6 1.588-1.962-3.996-.411-5.903-2.399-5.903-5.098 0-1.162.495-2.286 1.336-3.233-.276-.94-.623-2.857.106-3.587 1.798 0 2.885 1.166 3.146 1.481.896-.307 1.88-.481 2.914-.481 1.036 0 2.024.174 2.922.483.258-.313 1.346-1.483 3.148-1.483.732.731.381 2.656.102 3.594.836.945 1.328 2.066 1.328 3.226 0 2.697-1.904 4.684-5.894 5.097 1.098.573 1.899 2.183 1.899 3.396v2.734c0 .104-.023.179-.035.268 4.676-1.639 8.035-6.079 8.035-11.315C27 8.373 21.627 3 15 3Z"
      />
    </ProviderIconBase>
  );
}

function GoogleProviderIcon(props: ProviderIconProps) {
  return (
    <ProviderIconBase viewBox="0 0 30 30" {...props}>
      <path
        fill="currentColor"
        d="M15.004 3C8.375 3 3 8.373 3 15s5.375 12 12.004 12c10.01 0 12.265-9.293 11.326-14H15v4h7.738c-.89 3.448-4.012 6-7.738 6-4.418 0-8-3.582-8-8s3.582-8 8-8c2.009 0 3.839.746 5.244 1.969l2.842-2.84C20.952 4.185 18.117 3 15.004 3Z"
      />
    </ProviderIconBase>
  );
}

function AppleProviderIcon(props: ProviderIconProps) {
  return (
    <ProviderIconBase viewBox="0 0 30 30" {...props}>
      <path
        fill="currentColor"
        d="M25.565 9.785c-.123.077-3.051 1.702-3.051 5.305.138 4.109 3.695 5.55 3.756 5.55-.061.077-.537 1.963-1.947 3.94-1.119 1.703-2.361 3.42-4.247 3.42-1.794 0-2.438-1.135-4.508-1.135-2.223 0-2.852 1.135-4.554 1.135-1.886 0-3.22-1.809-4.4-3.496-1.533-2.208-2.836-5.673-2.882-9-.031-1.763.307-3.496 1.165-4.968 1.211-2.055 3.373-3.45 5.734-3.496 1.809-.061 3.419 1.242 4.523 1.242 1.058 0 3.036-1.242 5.274-1.242.966.001 3.542.292 5.137 2.745ZM15.001 6.688c-.322-1.61.567-3.22 1.395-4.247 1.058-1.242 2.729-2.085 4.17-2.085.092 1.61-.491 3.189-1.533 4.339-.935 1.242-2.545 2.177-4.032 1.993Z"
      />
    </ProviderIconBase>
  );
}

function MicrosoftProviderIcon(props: ProviderIconProps) {
  return (
    <ProviderIconBase viewBox="0 0 50 50" {...props}>
      <path
        fill="currentColor"
        d="M5 4c-.552 0-1 .447-1 1v19h20V4Zm21 0v20h20V5c0-.553-.448-1-1-1ZM4 26v19c0 .553.448 1 1 1h19V26Zm22 0v20h19c.552 0 1-.447 1-1V26Z"
      />
    </ProviderIconBase>
  );
}

export function AuthButtons({ providers, callbackUrl = "/", className }: AuthButtonsProps) {
  const redirectTo = sanitizeCallbackUrl(callbackUrl);

  return (
    <div className={cn("grid gap-2", className)}>
      {providers.map((provider) => (
        <form
          key={provider.id}
          action={async () => {
            "use server";
            await signIn(provider.id, { redirectTo });
          }}
        >
          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-between gap-3 border border-border/70 bg-background/50 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/50 hover:bg-accent/5"
          >
            <span className="inline-flex items-center gap-3">
              {getProviderIcon(provider.id)}
              <span>Continue with {provider.label}</span>
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </form>
      ))}
    </div>
  );
}
