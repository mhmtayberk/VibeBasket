import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  clean: true,
  minify: false,
  sourcemap: true,
  splitting: false,
  bundle: true,
  external: ["@libsql/client", "drizzle-orm"],
});
