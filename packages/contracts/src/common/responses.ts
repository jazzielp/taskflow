import { z } from 'zod'

/**
 * Convención de respuestas HTTP de la API.
 *
 *   Éxito:  { "data": {...} }
 *   Lista:  { "data": [...], "meta": { "total": 0 } }
 *   Error:  { "error": { "code": "PROJECT_NOT_FOUND", "message": "..." } }
 */

/**
 * Códigos de error estables. El cliente puede ramificar sobre el `code`;
 * el `message` es para humanos y puede cambiar.
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  FORBIDDEN: 'FORBIDDEN',
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  RATE_LIMITED: 'RATE_LIMITED',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export const errorCodeSchema = z.enum(ERROR_CODES).meta({
  id: 'ErrorCode',
  description:
    'Código de error estable. El cliente debe ramificar sobre este valor, no sobre `message`.',
})
export type ErrorCode = z.infer<typeof errorCodeSchema>

export type ApiSuccess<TData> = {
  data: TData
}

export const listMetaSchema = z
  .object({
    total: z
      .number()
      .int()
      .min(0)
      .meta({ description: 'Total de elementos que cumplen el filtro.' }),
    page: z.number().int().min(1).meta({ description: 'Página devuelta (empieza en 1).' }),
    limit: z.number().int().min(1).meta({ description: 'Tamaño de página aplicado.' }),
  })
  .meta({ id: 'ListMeta', description: 'Metadatos de paginación de un listado.' })
export type ListMeta = z.infer<typeof listMetaSchema>

export type ApiList<TItem> = {
  data: TItem[]
  meta: ListMeta
}

/** Detalle de un campo que no pasó la validación. */
export const apiErrorDetailSchema = z
  .object({
    path: z.string().meta({
      description: 'Ruta del campo que falló, con su origen: `body.email`, `query.page`...',
      example: 'body.email',
    }),
    message: z.string().meta({ example: 'Introduce un email válido' }),
  })
  .meta({ id: 'ApiErrorDetail', description: 'Detalle de un campo que no pasó la validación.' })
export type ApiErrorDetail = z.infer<typeof apiErrorDetailSchema>

export const apiErrorSchema = z
  .object({
    error: z.object({
      code: errorCodeSchema,
      message: z
        .string()
        .meta({ description: 'Mensaje para humanos. Puede cambiar entre versiones.' }),
      details: z.array(apiErrorDetailSchema).optional().meta({
        description: 'Presente solo en errores de validación.',
      }),
      requestId: z.string().optional().meta({
        description:
          'Identificador de la petición, también en la cabecera `x-request-id`. Úsalo al reportar una incidencia.',
      }),
    }),
  })
  .meta({ id: 'ApiError', description: 'Cuerpo de cualquier respuesta de error de la API.' })
export type ApiError = z.infer<typeof apiErrorSchema>
