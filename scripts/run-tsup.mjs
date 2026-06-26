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

function resolveTsupEntry() {
  for (const packageJsonPath of packageCandidates) {
    try {
      const scopedRequire = createRequire(packageJsonPath);
      return scopedRequire.resolve("tsup/dist/cli-default.js");
    } catch {}
  }

  throw new Error(`Unable to resolve tsup from ${packageCandidates.join(", ")}`);
}

const tsupEntry = resolveTsupEntry();
const args = process.argv.slice(2);

const result = spawnSync(process.execPath, [tsupEntry, ...args], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
