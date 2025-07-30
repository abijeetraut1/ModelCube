import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: true,
    outDir: ".vite/build",
    lib: {
      entry: "src/main.ts",
      formats: ["cjs"],
      fileName: () => "main.js", // Force the output filename to be main.js
    },
    rollupOptions: {
      external: [
        'node-llama-cpp',
        '@node-llama-cpp',
        'electron',
      ],
      output: {
        format: 'cjs',
        entryFileNames: 'main.js', // Alternative way to ensure the filename
      },
    },
  },
});