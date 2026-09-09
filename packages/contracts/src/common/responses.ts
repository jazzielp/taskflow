/**
 * Convención de respuestas HTTP de la API.
 *
 *   Éxito:  { "data": {...} }
 *   Lista:  { "data": [...], "meta": { "total": 0 } }
 *   Error:  { "error": { "code": "PROJECT_NOT_FOUND", "message": "..." } }
 */

export type ApiSuccess<TData> = {
  data: TData
}

export type ListMeta = {
  total: number
  page: number
  limit: number
}

export type ApiList<TItem> = {
  data: TItem[]
  meta: ListMeta
}

/** Detalle de un campo que no pasó la validación. */
export type ApiErrorDetail = {
  path: string
  message: string
}

export type ApiError = {
  error: {
    code: ErrorCode
    message: string
    details?: ApiErrorDetail[]
    requestId?: string
  }
}

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

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]
