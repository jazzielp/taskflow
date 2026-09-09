import { prisma, type User } from '@taskflow/database'

/**
 * Acceso a datos de usuarios.
 *
 * Es el ÚNICO sitio de la aplicación donde se consulta la tabla de usuarios
 * con Prisma. Ni los controllers ni los services hablan con la base de datos
 * directamente: si mañana cambiara el ORM, solo cambiaría este archivo.
 */
export const userRepository = {
  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } })
  },

  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } })
  },

  create(data: { name: string; email: string; passwordHash: string }): Promise<User> {
    return prisma.user.create({ data })
  },
}
