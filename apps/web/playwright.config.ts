import { defineConfig } from "@playwright/test";

const nodeExecPath = process.execPath;
const playwrightPort = process.env.PLAYWRIGHT_PORT ?? "3100";
const playwrightBaseUrl = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${playwrightPort}`;
const playwrightEnvPrefix = `NEXTAUTH_URL=${playwrightBaseUrl} AUTH_TRUST_HOST=1 AUTH_SECRET=vibebasket-e2e-secret`;

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
        command: process.env.PLAYWRIGHT_PREBUILT
          ? `${playwrightEnvPrefix} HOSTNAME=127.0.0.1 PORT=${playwrightPort} ${nodeExecPath} .next/standalone/apps/web/server.js`
          : `${playwrightEnvPrefix} ${nodeExecPath} ../../scripts/run-next.mjs build --webpack && ${playwrightEnvPrefix} HOSTNAME=127.0.0.1 PORT=${playwrightPort} ${nodeExecPath} .next/standalone/apps/web/server.js`,
        url: playwrightBaseUrl,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
