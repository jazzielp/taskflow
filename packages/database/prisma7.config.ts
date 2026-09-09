import { config as loadEnv } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

/**
 * Configuración del CLI de Prisma (v7).
 *
 * Las variables de entorno del monorepo viven en un único `.env` en la raíz,
 * así que lo cargamos explícitamente antes de leer DATABASE_URL.
 */
loadEnv({ path: new URL('../../.env', import.meta.url).pathname, quiet: true })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
    // Base temporal que `prisma migrate dev` usa para comprobar que las
    // migraciones reconstruyen exactamente el esquema actual. Se indica a mano
    // porque el rol de PostgreSQL no tiene CREATEDB y no puede crearla solo.
    // Es opcional: si la variable no existe, Prisma intenta crearla él mismo.
    ...(process.env['SHADOW_DATABASE_URL']
      ? { shadowDatabaseUrl: env('SHADOW_DATABASE_URL') }
      : {}),
  },
})
