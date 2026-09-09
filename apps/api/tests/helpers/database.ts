import { prisma } from '@taskflow/database'

/**
 * Deja la base de datos de test vacía.
 *
 * TRUNCATE ... CASCADE es mucho más rápido que borrar tabla por tabla y evita
 * tener que preocuparse por el orden de las claves foráneas.
 */
export async function resetDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "tasks", "projects", "users" CASCADE')
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
}
