import type { MetadataRoute } from "next";

/**
 * Highly secure, dynamic robots.txt builder.
 * Mitigates information leakage by explicitly disallowing crawlers from indexing
 * administrative dashboards, private auth sessions, and user stacks databases.
 */
export default function robots(): MetadataRoute.Robots {
	const baseUrl =
		process.env.NEXTAUTH_URL ||
		process.env.NEXT_PUBLIC_SITE_URL ||
		(process.env.NODE_ENV === "production"
			? "https://vibebasket.dev"
			: "http://localhost:3000");

	return {
		rules: {
			userAgent: "*",
			allow: ["/", "/stacks"],
			disallow: [
				"/admin",
				"/admin/",
				"/api/admin/",
				"/api/auth/",
				"/api/stacks/",
				"/_next/",
				"/static/",
			],
		},
		sitemap: `${baseUrl.replace(/\/$/, "")}/sitemap.xml`,
	};
}
