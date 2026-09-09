import { prisma, type Task, type TaskStatus } from '@taskflow/database'

/**
 * Tarea junto con lo mínimo del proyecto que la contiene para poder decidir
 * permisos: quién es su propietario.
 */
export type TaskWithProjectOwner = Task & { project: { id: string; ownerId: string } }

export const taskRepository = {
  async findManyByProject(params: {
    projectId: string
    page: number
    limit: number
    status?: TaskStatus | undefined
  }): Promise<{ items: Task[]; total: number }> {
    const { projectId, page, limit, status } = params
    const where = { projectId, ...(status ? { status } : {}) }

    const [items, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ])

    return { items, total }
  },

  findById(id: string): Promise<TaskWithProjectOwner | null> {
    return prisma.task.findUnique({
      where: { id },
      include: { project: { select: { id: true, ownerId: true } } },
    })
  },

  create(data: {
    projectId: string
    title: string
    description?: string | undefined
    status?: TaskStatus | undefined
  }): Promise<Task> {
    return prisma.task.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description ?? null,
        ...(data.status ? { status: data.status } : {}),
      },
    })
  },

  update(
    id: string,
    data: {
      title?: string | undefined
      description?: string | undefined
      status?: TaskStatus | undefined
    },
  ): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    })
  },

  async delete(id: string): Promise<void> {
    await prisma.task.delete({ where: { id } })
  },
}
