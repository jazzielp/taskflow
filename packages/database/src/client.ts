import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../generated/prisma/client'

/**
 * Cliente de Prisma compartido por todo el código de servidor.
 *
 * Prisma 7 no lleva motor nativo: se conecta a PostgreSQL a través de un
 * "driver adapter" (aquí, el driver `pg`).
 *
 * En desarrollo el proceso se recarga en caliente muchas veces; guardamos la
 * instancia en `globalThis` para no abrir un pool de conexiones nuevo en cada
 * recarga y agotar las conexiones de PostgreSQL.
 */
function createPrismaClient(): PrismaClient {
  const connectionString = process.env['DATABASE_URL']

  if (!connectionString) {
    throw new Error(
      'Falta DATABASE_URL. Copia .env.example a .env en la raíz del monorepo y rellénala.',
    )
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env['NODE_ENV'] === 'development' ? ['warn', 'error'] : ['error'],
  })
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient()

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma
}
