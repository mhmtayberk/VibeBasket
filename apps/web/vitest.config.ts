import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@vibebasket/adapters": path.resolve(__dirname, "../../packages/adapters/src"),
      "@vibebasket/adapters/target-capabilities": path.resolve(
        __dirname,
        "../../packages/adapters/src/target-capabilities.ts",
      ),
      "@vibebasket/adapters/types": path.resolve(__dirname, "../../packages/adapters/src/types.ts"),
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}"],
    exclude: ["e2e/**", "playwright.config.ts", "**/node_modules/**"],
  },
});
