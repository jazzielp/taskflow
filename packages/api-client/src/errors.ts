import { ERROR_CODES, type ApiErrorDetail, type ErrorCode } from '@taskflow/contracts'

/**
 * Códigos que nacen en el cliente, no en la API: la petición no llegó a
 * completarse o la respuesta no encaja con el contrato. Se mantienen separados
 * de `ERROR_CODES` porque el backend nunca los emite.
 */
export const CLIENT_ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
} as const
export type ClientErrorCode = (typeof CLIENT_ERROR_CODES)[keyof typeof CLIENT_ERROR_CODES]

export type ApiClientErrorCode = ErrorCode | ClientErrorCode

/**
 * Todo fallo del cliente llega a la UI como esta excepción, así que la interfaz
 * ramifica siempre sobre `code` y nunca sobre `message`, que es texto para
 * humanos y puede cambiar entre versiones de la API.
 */
export class ApiClientError extends Error {
  readonly code: ApiClientErrorCode
  /** 0 cuando la petición ni siquiera llegó a la API. */
  readonly status: number
  readonly details?: ApiErrorDetail[]
  readonly requestId?: string

  constructor(input: {
    code: ApiClientErrorCode
    message: string
    status?: number
    details?: ApiErrorDetail[]
    requestId?: string
    cause?: unknown
  }) {
    super(input.message, { cause: input.cause })
    this.name = 'ApiClientError'
    this.code = input.code
    this.status = input.status ?? 0
    this.details = input.details
    this.requestId = input.requestId
  }

  /** La sesión no vale: hay que volver a `/login`. */
  get isUnauthenticated(): boolean {
    return this.code === ERROR_CODES.UNAUTHENTICATED
  }

  get isValidationError(): boolean {
    return this.code === ERROR_CODES.VALIDATION_ERROR
  }
}

/**
 * Convierte los `details` de un error de validación en un mapa listo para un
 * formulario. La API devuelve la ruta con su origen (`body.email`, `query.page`)
 * y aquí se queda solo el nombre del campo, que es lo que conoce la UI.
 *
 *   [{ path: 'body.email', message: '...' }]  ->  { email: '...' }
 *
 * Si el mismo campo falla por varios motivos gana el primero: en un formulario
 * solo hay sitio para un mensaje por campo.
 */
export function fieldErrorsOf(error: unknown): Record<string, string> {
  if (!(error instanceof ApiClientError) || !error.details) return {}

  const fields: Record<string, string> = {}
  for (const detail of error.details) {
    const field = detail.path.split('.').slice(1).join('.') || detail.path
    fields[field] ??= detail.message
  }
  return fields
}
