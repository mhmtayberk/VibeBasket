import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
	accounts,
	db,
	sessions,
	users,
	verificationTokens,
} from "@vibebasket/core";
import NextAuth, { type DefaultSession } from "next-auth";
import { authConfig, getEnabledAuthProviders } from "@/auth.config";

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
		session({ session, user }) {
			if (session.user && user?.id) {
				session.user.id = user.id;

				// Dynamic role injection based on process.env.ADMIN_EMAILS
				// Strict verification check on database user emailVerified state
				const adminEmails = process.env.ADMIN_EMAILS
					? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
					: [];

				const hasVerifiedEmail = (user as any).emailVerified !== null;
				if (hasVerifiedEmail && user.email && adminEmails.includes(user.email.toLowerCase())) {
					session.user.role = "admin";
				} else {
					session.user.role = "user";
				}
			}

			return session;
		},
	},
	...authConfig,
});

export { authConfig, getEnabledAuthProviders };
