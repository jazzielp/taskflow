import { z } from 'zod'

import { taskStatusSchema } from '../common/enums'

/** Representación pública de una tarea. */
export const taskDtoSchema = z
  .object({
    id: z.uuid(),
    title: z.string().meta({ example: 'Escribir la documentación de la API' }),
    description: z.string().nullable(),
    status: taskStatusSchema,
    projectId: z.uuid().meta({ description: 'Proyecto al que pertenece la tarea.' }),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: 'Task', description: 'Representación pública de una tarea.' })

export type TaskDto = z.infer<typeof taskDtoSchema>
