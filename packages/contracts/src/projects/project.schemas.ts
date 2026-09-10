import { z } from 'zod'

import { LIMITS } from '../common/limits'

export const createProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(LIMITS.projectNameMinLength, 'El nombre del proyecto es obligatorio')
      .max(LIMITS.projectNameMaxLength)
      .meta({ example: 'Lanzamiento v1' }),
    description: z.string().trim().max(LIMITS.descriptionMaxLength).optional(),
  })
  .meta({ id: 'CreateProjectInput', description: 'Datos para crear un proyecto.' })
export type CreateProjectInput = z.infer<typeof createProjectSchema>

/**
 * PATCH: todos los campos son opcionales, pero el cuerpo no puede venir vacío
 * (un PATCH sin cambios es un error del cliente, no un no-op silencioso).
 *
 * El `.refine()` no tiene equivalente en JSON Schema, así que esa regla solo
 * puede contarse en la descripción; la validación real sigue estando aquí.
 */
export const updateProjectSchema = createProjectSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar',
  })
  .meta({
    id: 'UpdateProjectInput',
    description: 'Cambios a aplicar sobre un proyecto. Debe incluir al menos un campo.',
  })
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
