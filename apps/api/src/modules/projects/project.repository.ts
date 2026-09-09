import { prisma, type Project } from '@taskflow/database'

/** Proyecto con el número de tareas que contiene. */
export type ProjectWithTaskCount = Project & { _count: { tasks: number } }

/**
 * Acceso a datos de proyectos. Aquí, y solo aquí, se usa Prisma.
 * Este archivo no sabe nada de HTTP ni de permisos: devuelve o guarda datos.
 */
export const projectRepository = {
  async findManyByOwner(params: {
    ownerId: string
    page: number
    limit: number
  }): Promise<{ items: ProjectWithTaskCount[]; total: number }> {
    const { ownerId, page, limit } = params

    // Listado y total en la misma transacción: así el `total` que se devuelve
    // es coherente con la página que se devuelve.
    const [items, total] = await prisma.$transaction([
      prisma.project.findMany({
        where: { ownerId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { tasks: true } } },
      }),
      prisma.project.count({ where: { ownerId } }),
    ])

    return { items, total }
  },

  findById(id: string): Promise<ProjectWithTaskCount | null> {
    return prisma.project.findUnique({
      where: { id },
      include: { _count: { select: { tasks: true } } },
    })
  },

  create(data: {
    ownerId: string
    name: string
    description?: string | undefined
  }): Promise<ProjectWithTaskCount> {
    return prisma.project.create({
      data: {
        ownerId: data.ownerId,
        name: data.name,
        description: data.description ?? null,
      },
      include: { _count: { select: { tasks: true } } },
    })
  },

  update(
    id: string,
    data: { name?: string | undefined; description?: string | undefined },
  ): Promise<ProjectWithTaskCount> {
    return prisma.project.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
      },
      include: { _count: { select: { tasks: true } } },
    })
  },

  async delete(id: string): Promise<void> {
    // Las tareas del proyecto se borran solas: la relación es `onDelete: Cascade`.
    await prisma.project.delete({ where: { id } })
  },
}
