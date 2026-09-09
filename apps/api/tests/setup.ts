import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * Se ejecuta antes de cada archivo de test, y antes de que se importe nada de
 * `src/`.
 *
 * Aquí se fija DATABASE_URL a la base de datos de test. Es importante hacerlo
 * ANTES de que se cargue `@taskflow/database`, porque el cliente de Prisma lee
 * esa variable al crearse. `process.loadEnvFile` no pisa variables que ya
 * existen, así que el valor que se pone aquí es el que gana.
 */
process.env['NODE_ENV'] = 'test'

const rootEnv = fileURLToPath(new URL('../../../.env', import.meta.url))
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv)

const testDatabaseUrl = process.env['TEST_DATABASE_URL']
if (!testDatabaseUrl) {
  throw new Error('Falta TEST_DATABASE_URL en el .env de la raíz.')
}

process.env['DATABASE_URL'] = testDatabaseUrl
