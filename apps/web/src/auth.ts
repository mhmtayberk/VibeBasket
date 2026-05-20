import NextAuth, { type DefaultSession } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  accounts,
  db,
  sessions,
  users,
  verificationTokens,
} from "@vibebasket/core";
import { authConfig, getEnabledAuthProviders } from "@/auth.config";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id?: string;
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
    session({ session, user }) {
      if (session.user && user?.id) {
        session.user.id = user.id;
      }

      return session;
    },
  },
  ...authConfig,
});

export { authConfig, getEnabledAuthProviders };
