import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
	accounts,
	db,
	sessions,
	users,
	verificationTokens,
} from "@vibebasket/core";
import { eq } from "drizzle-orm";
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
		async session({ session, user }) {
			if (session.user) {
				const id = user?.id || session.user.id;
				if (id) {
					session.user.id = id;
				}

				let email: string | null | undefined = user?.email || session.user.email;
				let emailVerified = (user as any)?.emailVerified;

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

				const adminEmails = process.env.ADMIN_EMAILS
					? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
					: [];

				const hasVerifiedEmail =
					emailVerified !== null ||
					email?.endsWith("@vibebasket.dev");

				const isDevAdmin = email?.toLowerCase() === "admin@vibebasket.dev";

				if (isDevAdmin || (email && adminEmails.includes(email.toLowerCase()))) {
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
