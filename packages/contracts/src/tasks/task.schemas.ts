import { z } from 'zod'

import { taskStatusSchema } from '../common/enums'
import { LIMITS } from '../common/limits'
import { paginationQuerySchema } from '../common/pagination'

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(LIMITS.taskTitleMinLength, 'El título es obligatorio')
    .max(LIMITS.taskTitleMaxLength),
  description: z.string().trim().max(LIMITS.descriptionMaxLength).optional(),
  status: taskStatusSchema.optional(),
})
export type CreateTaskInput = z.infer<typeof createTaskSchema>

export const updateTaskSchema = createTaskSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar',
  })
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

export const updateTaskStatusSchema = z.object({
  status: taskStatusSchema,
})
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>

/** Filtros del listado de tareas de un proyecto. */
export const listTasksQuerySchema = paginationQuerySchema.extend({
  status: taskStatusSchema.optional(),
})
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>
