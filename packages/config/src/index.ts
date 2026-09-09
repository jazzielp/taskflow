/**
 * @taskflow/config
 *
 * Constantes y configuración compartida entre aplicaciones.
 *
 * IMPORTANTE: este paquete lo importan también los clientes (web y mobile),
 * por lo que NUNCA debe contener secretos de servidor (DATABASE_URL,
 * JWT_SECRET, claves privadas...). Solo valores públicos.
 */

/** Prefijo bajo el que se montan todas las rutas de la API. */
export const API_PREFIX = '/api'

/** Cabecera que transporta el identificador de request para trazar errores. */
export const REQUEST_ID_HEADER = 'x-request-id'

/** Esquema del token en la cabecera Authorization: `Bearer <token>`. */
export const AUTH_SCHEME = 'Bearer'

/** Valores por defecto de paginación de listados. */
export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
} as const

/** Rate limiting de los endpoints de autenticación. */
export const AUTH_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  max: 20,
} as const
