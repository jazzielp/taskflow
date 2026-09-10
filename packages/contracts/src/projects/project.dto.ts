import { z } from 'zod'

/** Representación pública de un proyecto. */
export const projectDtoSchema = z
  .object({
    id: z.uuid(),
    name: z.string().meta({ example: 'Lanzamiento v1' }),
    description: z.string().nullable(),
    ownerId: z.uuid().meta({ description: 'Usuario propietario del proyecto.' }),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    /** Número de tareas del proyecto (presente en listados y detalle). */
    taskCount: z.number().int().min(0).optional().meta({
      description: 'Número de tareas del proyecto (presente en listados y detalle).',
    }),
  })
  .meta({ id: 'Project', description: 'Representación pública de un proyecto.' })

export type ProjectDto = z.infer<typeof projectDtoSchema>
