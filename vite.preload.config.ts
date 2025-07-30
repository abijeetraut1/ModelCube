import { defineConfig } from 'vite';
import { builtinModules } from "node:module";

export default defineConfig({
  build: {
    sourcemap: true,
    outDir: ".vite/build", // Changed from ".vite/preload" to ".vite/build"
    emptyOutDir: false, // Changed to false to not delete main.js
    lib: {
      entry: "src/preload.ts",
      formats: ["cjs"],
      fileName: () => "preload.js", // Force filename to be preload.js
    },
    rollupOptions: {
      external: ['electron', ...builtinModules],
      output: {
        format: 'cjs',
        entryFileNames: 'preload.js',
      },
    },
  },
});