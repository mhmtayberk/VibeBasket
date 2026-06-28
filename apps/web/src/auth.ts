import { authConfig, getEnabledAuthProviders } from "@/auth.config";
import { shouldGrantAdminRole } from "@/lib/admin-role";
import { isTrustedOAuthEmailVerified } from "@/lib/auth-email-verification";
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
    async session({ session, user }) {
      if (session.user) {
        const id = user?.id || session.user.id;
        if (id) {
          session.user.id = id;
        }

        let email: string | null | undefined = user?.email || session.user.email;
        let emailVerified = (user as { emailVerified?: Date | null } | undefined)?.emailVerified;

        // Safe fallback: Query database if values are missing for some reason
        if (id && (!email || emailVerified === undefined)) {
          try {
            const dbUser = await db
              .select({
                email: users.email,
                emailVerified: users.emailVerified,
              })
              .from(users)
              .where(eq(users.id, id))
              .limit(1);

            if (dbUser[0]) {
              email = dbUser[0].email;
              emailVerified = dbUser[0].emailVerified;
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
    async signIn({ user, account, profile }) {
      if (!user.id || !account || account.type !== "oauth") {
        return;
      }

      if (!isTrustedOAuthEmailVerified(account.provider, profile)) {
        return;
      }

      try {
        await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, user.id));
      } catch (error) {
        console.error("Failed to persist verified OAuth email state:", error);
      }
    },
  },
  ...authConfig,
});

export { authConfig, getEnabledAuthProviders };
