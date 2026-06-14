import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, "..");
const packageCandidates = [
  path.join(process.cwd(), "package.json"),
  path.join(workspaceRoot, "package.json"),
];

function resolveVitestEntry() {
  for (const packageJsonPath of packageCandidates) {
    try {
      const scopedRequire = createRequire(packageJsonPath);
      return scopedRequire.resolve("vitest/vitest.mjs");
    } catch {}
  }

  throw new Error(`Unable to resolve vitest/vitest.mjs from ${packageCandidates.join(", ")}`);
}

const vitestEntry = resolveVitestEntry();
const args = process.argv.slice(2);

const result = spawnSync(process.execPath, [vitestEntry, ...args], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
