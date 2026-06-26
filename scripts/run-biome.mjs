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

function resolveBiomeEntry() {
  for (const packageJsonPath of packageCandidates) {
    try {
      const scopedRequire = createRequire(packageJsonPath);
      return scopedRequire.resolve("@biomejs/biome/bin/biome");
    } catch {}
  }

  throw new Error(`Unable to resolve @biomejs/biome from ${packageCandidates.join(", ")}`);
}

const biomeEntry = resolveBiomeEntry();
const args = process.argv.slice(2);

const result = spawnSync(process.execPath, [biomeEntry, ...args], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
