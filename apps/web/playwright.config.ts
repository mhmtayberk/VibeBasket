import { defineConfig } from "@playwright/test";

const playwrightPort = process.env.PLAYWRIGHT_PORT ?? "3100";
const playwrightBaseUrl =
	process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${playwrightPort}`;

export default defineConfig({
	testDir: "./e2e",
	timeout: 30_000,
	use: {
		baseURL: playwrightBaseUrl,
		trace: "retain-on-failure",
	},
	webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
		? undefined
		: {
				command: `AUTH_TRUST_HOST=1 AUTH_SECRET=vibebasket-e2e-secret pnpm exec next start --hostname 127.0.0.1 --port ${playwrightPort}`,
				url: playwrightBaseUrl,
				reuseExistingServer: true,
				timeout: 120_000,
			},
});
