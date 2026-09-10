import { ERROR_CODES, PAGINATION_DEFAULTS, type ErrorCode } from '@taskflow/contracts'

import { jsonResponse, schemaRef } from './helpers'
import type { JsonSchema, ParameterObject, Ref, ResponseObject } from './types'

/**
 * Piezas reutilizables del documento: seguridad, parámetros comunes y las
 * respuestas de error.
 *
 * Los errores se declaran una sola vez y cada endpoint los referencia. Así la
 * documentación cuenta exactamente los mismos códigos que produce
 * `middleware/error.middleware.ts`, y añadir un código nuevo es un cambio en un
 * único sitio.
 */

export const securitySchemes: Record<string, JsonSchema> = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description:
      'Token devuelto por `POST /auth/register` o `POST /auth/login`. Se envía en la cabecera `Authorization: Bearer <token>`.',
  },
}

export const parameters: Record<string, ParameterObject> = {
  IdPath: {
    name: 'id',
    in: 'path',
    required: true,
    description: 'Identificador del recurso.',
    schema: { type: 'string', format: 'uuid' },
  },
  ProjectIdPath: {
    name: 'projectId',
    in: 'path',
    required: true,
    description: 'Identificador del proyecto.',
    schema: { type: 'string', format: 'uuid' },
  },
  PageQuery: {
    name: 'page',
    in: 'query',
    required: false,
    description: 'Página a devolver. Empieza en 1.',
    schema: { type: 'integer', minimum: 1, default: PAGINATION_DEFAULTS.page },
  },
  LimitQuery: {
    name: 'limit',
    in: 'query',
    required: false,
    description: 'Número de elementos por página.',
    schema: {
      type: 'integer',
      minimum: 1,
      maximum: PAGINATION_DEFAULTS.maxLimit,
      default: PAGINATION_DEFAULTS.limit,
    },
  },
  TaskStatusQuery: {
    name: 'status',
    in: 'query',
    required: false,
    description: 'Devuelve solo las tareas en este estado. Si se omite, se devuelven todas.',
    schema: schemaRef('TaskStatus'),
  },
}

/**
 * Catálogo de errores documentados.
 *
 * Un mismo estado HTTP puede corresponder a varios códigos (401 es
 * `UNAUTHENTICATED` en una ruta protegida pero `INVALID_CREDENTIALS` en el
 * login), por eso la clave es el nombre del caso y el estado va dentro.
 */
const ERROR_CATALOG = {
  Unauthenticated: {
    status: 401,
    code: ERROR_CODES.UNAUTHENTICATED,
    message: 'Necesitas iniciar sesión',
    description: 'Falta el token, es inválido o ha caducado.',
  },
  InvalidCredentials: {
    status: 401,
    code: ERROR_CODES.INVALID_CREDENTIALS,
    message: 'Email o contraseña incorrectos',
    description:
      'Credenciales incorrectas. El mensaje es deliberadamente ambiguo: no revela si el email existe.',
  },
  Forbidden: {
    status: 403,
    code: ERROR_CODES.FORBIDDEN,
    message: 'No tienes permiso para realizar esta acción',
    description: 'Hay sesión válida, pero no permiso sobre este recurso.',
  },
  ProjectNotFound: {
    status: 404,
    code: ERROR_CODES.PROJECT_NOT_FOUND,
    message: 'Proyecto no encontrado',
    description: 'El proyecto no existe o no pertenece a quien lo pide.',
  },
  TaskNotFound: {
    status: 404,
    code: ERROR_CODES.TASK_NOT_FOUND,
    message: 'Tarea no encontrada',
    description: 'La tarea no existe o no pertenece a quien la pide.',
  },
  UserNotFound: {
    status: 404,
    code: ERROR_CODES.USER_NOT_FOUND,
    message: 'Usuario no encontrado',
    description: 'El usuario del token ya no existe.',
  },
  EmailAlreadyExists: {
    status: 409,
    code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
    message: 'Ya existe una cuenta con ese email',
    description: 'Ese email ya está registrado.',
  },
  ValidationError: {
    status: 422,
    code: ERROR_CODES.VALIDATION_ERROR,
    message: 'Los datos enviados no son válidos',
    description:
      'La entrada no cumple el contrato. `error.details` indica qué campo ha fallado y por qué.',
  },
  InvalidStatusTransition: {
    status: 422,
    code: ERROR_CODES.INVALID_STATUS_TRANSITION,
    message: 'No se puede pasar una tarea de DONE a TODO. Estados posibles: IN_PROGRESS.',
    description: 'El cambio de estado solicitado no está permitido por el dominio.',
  },
  RateLimited: {
    status: 429,
    code: ERROR_CODES.RATE_LIMITED,
    message: 'Demasiados intentos. Inténtalo de nuevo en unos minutos.',
    description: 'Se ha superado el límite de peticiones para esta IP.',
  },
  InternalError: {
    status: 500,
    code: ERROR_CODES.INTERNAL_ERROR,
    message: 'Ha ocurrido un error inesperado',
    description:
      'Fallo no previsto. Nunca expone detalles internos; usa `error.requestId` para rastrearlo en los logs.',
  },
} as const satisfies Record<
  string,
  { status: number; code: ErrorCode; message: string; description: string }
>

export type ErrorName = keyof typeof ERROR_CATALOG

export const errorResponses: Record<string, ResponseObject> = Object.fromEntries(
  Object.entries(ERROR_CATALOG).map(([name, entry]) => [
    name,
    jsonResponse(`${entry.status} — ${entry.description}`, schemaRef('ApiError'), {
      error: { code: entry.code, message: entry.message },
    }),
  ]),
)

/**
 * Devuelve el bloque `responses` para los errores indicados.
 *
 *   errors('Unauthenticated', 'ProjectNotFound')
 *   -> { '401': { $ref: ... }, '404': { $ref: ... } }
 *
 * `InternalError` se añade siempre: cualquier endpoint puede fallar de forma
 * inesperada y documentarlo endpoint a endpoint sería puro ruido.
 */
export function errors(...names: ErrorName[]): Record<string, Ref> {
  const responses: Record<string, Ref> = {}

  for (const name of [...names, 'InternalError' as const]) {
    responses[String(ERROR_CATALOG[name].status)] = {
      $ref: `#/components/responses/${name}`,
    }
  }

  return responses
}
