import { z } from 'zod'

import { taskStatusSchema } from '../common/enums'
import { LIMITS } from '../common/limits'
import { paginationQuerySchema } from '../common/pagination'

export const createTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(LIMITS.taskTitleMinLength, 'El título es obligatorio')
      .max(LIMITS.taskTitleMaxLength)
      .meta({ example: 'Escribir la documentación de la API' }),
    description: z.string().trim().max(LIMITS.descriptionMaxLength).optional(),
    status: taskStatusSchema.optional(),
  })
  .meta({
    id: 'CreateTaskInput',
    description: 'Datos para crear una tarea. Si se omite `status`, la tarea nace en `TODO`.',
  })
export type CreateTaskInput = z.infer<typeof createTaskSchema>

/** Ver la nota sobre `.refine()` en `updateProjectSchema`. */
export const updateTaskSchema = createTaskSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar',
  })
  .meta({
    id: 'UpdateTaskInput',
    description: 'Cambios a aplicar sobre una tarea. Debe incluir al menos un campo.',
  })
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

export const updateTaskStatusSchema = z
  .object({ status: taskStatusSchema })
  .meta({ id: 'UpdateTaskStatusInput', description: 'Nuevo estado de la tarea.' })
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>

/** Filtros del listado de tareas de un proyecto. */
export const listTasksQuerySchema = paginationQuerySchema.extend({
  status: taskStatusSchema.optional(),
})
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>
