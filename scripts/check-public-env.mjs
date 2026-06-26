import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ALLOWED_PUBLIC_ENV_VARS = new Set(["NEXT_PUBLIC_SITE_URL"]);

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NEXT_PUBLIC_PATTERN = /\bNEXT_PUBLIC_[A-Z0-9_]+\b/g;

const INCLUDED_ROOT_PREFIXES = [".github/", "apps/", "charts/", "packages/", "scripts/"];

const INCLUDED_ROOT_FILES = new Set([
  ".env.example",
  "Dockerfile",
  "docker-compose.yml",
  "package.json",
  "pnpm-workspace.yaml",
]);

const IGNORED_FILES = new Set([
  "scripts/check-public-env.mjs",
  "scripts/check-public-env.test.mjs",
]);

const SCANNABLE_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".json",
  ".jsx",
  ".mjs",
  ".mts",
  ".sh",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
]);

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function shouldScanFile(relativePath) {
  if (IGNORED_FILES.has(relativePath)) {
    return false;
  }

  if (INCLUDED_ROOT_FILES.has(relativePath)) {
    return true;
  }

  if (!INCLUDED_ROOT_PREFIXES.some((prefix) => relativePath.startsWith(prefix))) {
    return false;
  }

  const extension = path.extname(relativePath);
  if (SCANNABLE_EXTENSIONS.has(extension)) {
    return true;
  }

  return path.basename(relativePath).startsWith(".env");
}

function getTrackedFiles(cwd) {
  const output = execFileSync("git", ["ls-files", "-z"], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  return output
    .split("\0")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function extractPublicEnvReferences(content) {
  return [...new Set(content.match(NEXT_PUBLIC_PATTERN) ?? [])].sort();
}

export function findDisallowedPublicEnvReferences(
  files,
  allowedPublicEnvVars = ALLOWED_PUBLIC_ENV_VARS,
) {
  return files
    .map(({ path: filePath, content }) => {
      const matches = extractPublicEnvReferences(content).filter(
        (match) => !allowedPublicEnvVars.has(match),
      );

      return matches.length > 0 ? { path: filePath, variables: matches } : null;
    })
    .filter(Boolean);
}

export function collectScannableFiles(cwd = PROJECT_ROOT) {
  return getTrackedFiles(cwd)
    .filter(shouldScanFile)
    .map((relativePath) => ({
      path: normalizePath(relativePath),
      content: fs.readFileSync(path.join(cwd, relativePath), "utf8"),
    }));
}

export function assertAllowlistedPublicEnvUsage(cwd = PROJECT_ROOT) {
  const violations = findDisallowedPublicEnvReferences(collectScannableFiles(cwd));

  if (violations.length === 0) {
    return;
  }

  const lines = violations.map(
    ({ path: filePath, variables }) => `- ${filePath}: ${variables.join(", ")}`,
  );

  throw new Error(
    [
      "Disallowed public environment variables detected.",
      "Only explicitly reviewed NEXT_PUBLIC_* variables may exist in executable/config files.",
      `Allowed today: ${[...ALLOWED_PUBLIC_ENV_VARS].sort().join(", ")}`,
      ...lines,
      "Move secrets and server-only configuration to non-public env names, or intentionally extend the allowlist in scripts/check-public-env.mjs.",
    ].join("\n"),
  );
}

const invokedScriptUrl = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;

if (invokedScriptUrl && import.meta.url === invokedScriptUrl) {
  try {
    assertAllowlistedPublicEnvUsage();
    console.log(
      `NEXT_PUBLIC guard passed. Allowed public envs: ${[...ALLOWED_PUBLIC_ENV_VARS].join(", ")}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
}
