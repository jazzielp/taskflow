import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * Se ejecuta UNA vez antes de toda la batería de tests.
 *
 * Aplica las migraciones sobre la base de datos de test. Es una base separada
 * de la de desarrollo (TEST_DATABASE_URL) porque los tests borran datos entre
 * pruebas: apuntar aquí a la BD de desarrollo destruiría el seed.
 */
export default function setup(): void {
  const rootEnv = fileURLToPath(new URL('../../../.env', import.meta.url))
  if (existsSync(rootEnv)) process.loadEnvFile(rootEnv)

  const testDatabaseUrl = process.env['TEST_DATABASE_URL']

  if (!testDatabaseUrl) {
    throw new Error(
      'Falta TEST_DATABASE_URL en el .env de la raíz.\n' +
        'Debe apuntar a una base de datos DISTINTA de la de desarrollo: los tests la vacían.',
    )
  }

  const databasePackage = fileURLToPath(new URL('../../../packages/database', import.meta.url))

  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    cwd: databasePackage,
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: 'inherit',
  })
}
