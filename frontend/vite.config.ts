import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: fileURLToPath(new URL("./src/octopus-media-card.ts", import.meta.url)),
      formats: ["es"],
      name: "OctopusMediaCard",
    },
    minify: "esbuild",
    outDir: fileURLToPath(new URL("../dist", import.meta.url)),
    rollupOptions: {
      output: {
        entryFileNames: "octopus-media-card.js",
        inlineDynamicImports: true,
      },
    },
    sourcemap: false,
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./tests/setup.ts"],
  },
});
