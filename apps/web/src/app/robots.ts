import type { MetadataRoute } from "next";

/**
 * Highly secure, dynamic robots.txt builder.
 * Mitigates information leakage by explicitly disallowing crawlers from indexing
 * administrative dashboards, private auth sessions, and user stacks databases.
 */
export default function robots(): MetadataRoute.Robots {
	const baseUrl = process.env.NEXTAUTH_URL || "https://vibebasket.dev";

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
