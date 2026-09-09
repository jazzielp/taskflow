import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // Prepara la base de datos de test una sola vez (migraciones).
    globalSetup: ['./tests/global-setup.ts'],
    // Se ejecuta antes de cada archivo de test: apunta la app a la BD de test.
    setupFiles: ['./tests/setup.ts'],
    // Todos los tests comparten una única base de datos y se limpian entre
    // pruebas, así que no pueden correr en paralelo.
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 60_000,
    include: ['tests/**/*.test.ts'],
  },
})
