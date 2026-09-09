import { z } from 'zod'

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const

/**
 * Query de paginación. Llega siempre como string en la URL, por eso se usa
 * `coerce`: la API valida y convierte, nunca confía en el tipo recibido.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION_DEFAULTS.page),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION_DEFAULTS.maxLimit)
    .default(PAGINATION_DEFAULTS.limit),
})
export type PaginationQuery = z.infer<typeof paginationQuerySchema>
