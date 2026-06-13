import chalk from "chalk";

function getApiBaseUrl(): string {
	return process.env.VIBEBASKET_API_URL || "https://vibebasket.dev";
}

export async function runSearch(query: string) {
	const q = encodeURIComponent(query.trim());
	if (!q) {
		console.log(chalk.yellow("Usage: vibebasket search <query>"));
		return;
	}

	const baseUrl = getApiBaseUrl();
	console.log(chalk.bold(`\n🔍 Searching VibeBasket catalog for "${query}"...\n`));

	try {
		const res = await fetch(
			`${baseUrl}/api/catalog?type=mcp&q=${q}&limit=10`,
			{ signal: AbortSignal.timeout(10000) },
		);

		if (!res.ok) {
			console.log(chalk.red("Catalog API returned an error. Is the server running?"));
			console.log(chalk.gray("  Try: vibebasket search <query> --local  (coming soon)"));
			return;
		}

		const data = await res.json();
		if (!data.items?.length) {
			console.log(chalk.yellow("No results found."));
			return;
		}

		for (const item of data.items) {
			const typeColor = item.type === "mcp" ? chalk.cyan : chalk.yellow;
			console.log(`  ${typeColor(`[${item.type.toUpperCase()}]`)} ${chalk.bold(item.displayName)}`);
			if (item.description) {
				console.log(`    ${chalk.gray(item.description.slice(0, 120))}`);
			}
			console.log();
		}

		if (data.pagination?.total > data.items.length) {
			console.log(chalk.gray(`  (${data.pagination.total} total results. Visit ${baseUrl} for more)`));
		}
	} catch {
		console.log(chalk.red("Could not reach the catalog API."));
		console.log(chalk.gray(`  Make sure you have internet access, or visit ${baseUrl}`));
	}
}
