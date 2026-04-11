import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/lib/**/*.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist/lib',
  clean: true,
  sourcemap: true,
  // Each file compiles to its own output — no bundling into one file.
  // Skills reference individual compiled modules: node ../../dist/lib/paths.js
  bundle: false,
});
