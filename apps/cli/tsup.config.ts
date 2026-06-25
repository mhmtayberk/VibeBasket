import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  dts: false,
  bundle: true,
  clean: true,
  external: ["keytar"],
  noExternal: [/@vibebasket\/adapters/, /@vibebasket\/core/],
  shims: true,
  minify: true,
});
