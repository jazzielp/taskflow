/**
 * @taskflow/database
 *
 * Único punto de acceso a PostgreSQL en todo el monorepo.
 *
 * SOLO puede importarse desde código de servidor (apps/api y futuros
 * workers/CLI). apps/web y apps/mobile NUNCA deben importar este paquete:
 * hablan con la API, no con la base de datos.
 */
export { prisma } from './client'

export { PrismaClient, Prisma } from '../generated/prisma/client'
export type { User, Project, Task } from '../generated/prisma/client'
export { Role, TaskStatus } from '../generated/prisma/enums'
