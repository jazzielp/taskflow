import { z } from 'zod'

import { LIMITS } from '../common/limits'

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(LIMITS.projectNameMinLength, 'El nombre del proyecto es obligatorio')
    .max(LIMITS.projectNameMaxLength),
  description: z.string().trim().max(LIMITS.descriptionMaxLength).optional(),
})
export type CreateProjectInput = z.infer<typeof createProjectSchema>

/**
 * PATCH: todos los campos son opcionales, pero el cuerpo no puede venir vacío
 * (un PATCH sin cambios es un error del cliente, no un no-op silencioso).
 */
export const updateProjectSchema = createProjectSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar',
  })
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
