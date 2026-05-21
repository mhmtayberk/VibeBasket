import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}"],
		exclude: ["e2e/**", "playwright.config.ts", "**/node_modules/**"],
	},
});
