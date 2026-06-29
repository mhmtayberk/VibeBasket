import { signOut } from "@/auth";
import { ArrowUpRight, LogOut, Shield, User2 } from "lucide-react";
import type { Session } from "next-auth";
import Link from "next/link";

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
  const isAdmin = session.user?.role === "admin";

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      {isAdmin ? (
        <Link
          href="/admin"
          className="hidden items-center gap-2 border border-accent/70 bg-accent/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground 2xl:inline-flex"
        >
          <Shield className="h-3.5 w-3.5" />
          Admin
        </Link>
      ) : null}

      <Link
        href="/stacks"
        className="flex min-w-0 items-center gap-2 border border-border/80 bg-card/70 px-2 py-2 transition-colors hover:border-accent/40 sm:px-3"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-xs font-semibold text-accent sm:h-9 sm:w-9">
          {getUserInitials(session)}
        </div>

        <div className="hidden min-w-0 2xl:block 2xl:max-w-[180px]">
          <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            My Stacks
          </p>
        </div>

        <div className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:inline-flex 2xl:hidden">
          <User2 className="h-3.5 w-3.5" />
          Stacks
        </div>

        <ArrowUpRight className="hidden h-4 w-4 shrink-0 text-muted-foreground xl:block" />
      </Link>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="inline-flex h-10 w-10 items-center justify-center border border-border/80 bg-card/70 text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
