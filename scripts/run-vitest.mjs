import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const vitestEntry = require.resolve("vitest/vitest.mjs");
const args = process.argv.slice(2);

const result = spawnSync(process.execPath, [vitestEntry, ...args], {
	stdio: "inherit",
	env: process.env,
});

if (result.error) {
	throw result.error;
}

process.exit(result.status ?? 1);
