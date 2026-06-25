import { argv, exit } from "node:process";

const dryRun = argv.includes("--dry-run");
const strict = argv.includes("--strict");
const quiet = argv.includes("--quiet");
const trigger = dryRun ? "manual-dry-run" : "manual";

function logProgress(message) {
  if (!quiet) {
    console.error(`[catalog-sync] ${message}`);
  }
}

try {
  const { RegistrySyncService } = await import("../packages/registry/dist/index.js");
  const startedAt = Date.now();
  logProgress(`starting ${dryRun ? "dry-run " : ""}sync`);
  const summary = await new RegistrySyncService({
    persist: !dryRun,
    trigger,
    onProgress(event) {
      if (event.stage === "collector-start") {
        logProgress(`collecting ${event.source}...`);
        return;
      }

      if (event.stage === "collector-complete") {
        logProgress(
          `${event.source} completed in ${event.durationMs}ms (${event.itemCount ?? 0} items)`,
        );
        return;
      }

      logProgress(
        `${event.source} failed in ${event.durationMs}ms: ${event.error ?? "unknown error"}`,
      );
    },
  }).syncAll();
  logProgress(`sync finished in ${Date.now() - startedAt}ms`);

  console.log(
    JSON.stringify(
      {
        dryRun,
        strict,
        durationMs: Date.now() - startedAt,
        summary,
      },
      null,
      2,
    ),
  );

  if (strict && summary.sourceErrors.length > 0) {
    exit(2);
  }
} catch (error) {
  console.error(error);
  exit(1);
}
