import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // Los paquetes internos se distribuyen como código fuente TypeScript,
  // así que hay que incluirlos en el bundle en lugar de dejarlos como externos.
  noExternal: [/^@taskflow\//],
})
