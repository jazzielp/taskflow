import { z } from 'zod'

/** `/:id` donde el id es un UUID. */
export const idParamsSchema = z.object({
  id: z.uuid('El identificador debe ser un UUID válido'),
})
export type IdParams = z.infer<typeof idParamsSchema>

/** `/:projectId` donde el id es un UUID. */
export const projectIdParamsSchema = z.object({
  projectId: z.uuid('El identificador de proyecto debe ser un UUID válido'),
})
export type ProjectIdParams = z.infer<typeof projectIdParamsSchema>
