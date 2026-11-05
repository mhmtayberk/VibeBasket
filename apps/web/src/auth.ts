import { authConfig, getEnabledAuthProviders } from "@/auth.config";
import { shouldGrantAdminRole } from "@/lib/admin-role";
import { isTrustedOAuthEmailVerified, isTrustedOAuthProvider } from "@/lib/auth-email-verification";
import { shouldRefreshSessionUser } from "@/lib/session-user-state";
import { getAdminEmails } from "@/lib/site-config";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, db, sessions, users, verificationTokens } from "@vibebasket/core";
import { eq } from "drizzle-orm";
import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id?: string;
      role?: "admin" | "user";
    };
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.id || !account || account.type !== "oauth") {
        return true;
      }

      if (!isTrustedOAuthProvider(account.provider)) {
        return true;
      }

      const emailVerified = isTrustedOAuthEmailVerified(account.provider, profile, user.email);
      try {
        await db
          .update(users)
          .set({
            emailVerified: emailVerified ? new Date() : null,
            emailVerificationProvider: emailVerified ? account.provider : null,
          })
          .where(eq(users.id, user.id));
      } catch (error) {
        console.error("Failed to persist verified OAuth email state:", error);
        return false;
      }

      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        const id = user?.id || session.user.id;
        if (id) {
          session.user.id = id;
        }

        let email: string | null | undefined = user?.email || session.user.email;
        let emailVerified = (user as { emailVerified?: Date | null } | undefined)?.emailVerified;
        let emailVerificationProvider = (
          user as { emailVerificationProvider?: string | null } | undefined
        )?.emailVerificationProvider;

        // Safe fallback: Query database if values are missing for some reason
        if (id && shouldRefreshSessionUser(email, emailVerified, emailVerificationProvider)) {
          try {
            const dbUser = await db
              .select({
                email: users.email,
                emailVerified: users.emailVerified,
                emailVerificationProvider: users.emailVerificationProvider,
              })
              .from(users)
              .where(eq(users.id, id))
              .limit(1);

            if (dbUser[0]) {
              email = dbUser[0].email;
              emailVerified = dbUser[0].emailVerified;
              emailVerificationProvider = dbUser[0].emailVerificationProvider;
            }
          } catch (err) {
            console.error("Failed to query user for session role:", err);
          }
        }

        const adminEmails = await getAdminEmails().catch(() => [] as string[]);

        if (
          shouldGrantAdminRole({
            adminEmails,
            email,
            emailVerified,
            emailVerificationProvider,
            nodeEnv: process.env.NODE_ENV,
          })
        ) {
          session.user.role = "admin";
        } else {
          session.user.role = "user";
        }
      }

      return session;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      if (!isNewUser || !user.id || !account || account.type !== "oauth") {
        return;
      }

      if (!isTrustedOAuthProvider(account.provider)) {
        return;
      }

      const emailVerified = isTrustedOAuthEmailVerified(account.provider, profile, user.email);
      try {
        await db
          .update(users)
          .set({
            emailVerified: emailVerified ? new Date() : null,
            emailVerificationProvider: emailVerified ? account.provider : null,
          })
          .where(eq(users.id, user.id));
      } catch (error) {
        // New users have no stale verification state to preserve. Leaving the
        // provenance empty keeps admin-role evaluation fail-closed.
        console.error("Failed to persist new OAuth email verification state:", error);
      }
    },
  },
  ...authConfig,
});

export { authConfig, getEnabledAuthProviders };
