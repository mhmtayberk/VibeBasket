import { signOut } from "@/auth";
import { LogOut, User2 } from "lucide-react";
import type { Session } from "next-auth";

type AuthMenuProps = {
  session: Session;
};

function getUserInitials(session: Session) {
  const source = session.user?.name ?? session.user?.email ?? "VB";
  const initials = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "VB";
}

export function AuthMenu({ session }: AuthMenuProps) {
  const displayName = session.user?.name ?? session.user?.email ?? "Signed in";

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      {session.user?.role === "admin" ? (
        <a
          href="/admin"
          className="hidden items-center gap-2 border border-accent bg-accent/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground xl:inline-flex"
        >
          Admin Panel
        </a>
      ) : (
        <a
          href="/stacks"
          className="hidden items-center gap-2 border border-border/80 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground xl:inline-flex"
        >
          <User2 className="h-3.5 w-3.5" />
          My Stacks
        </a>
      )}

      <div className="flex min-w-0 items-center gap-2 border border-border/80 bg-card/70 px-2.5 py-2 sm:px-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-xs font-semibold text-accent sm:h-9 sm:w-9">
          {getUserInitials(session)}
        </div>

        <div className="hidden min-w-0 lg:block lg:max-w-[160px] xl:max-w-[220px]">
          <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground xl:block">
            Authenticated
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
