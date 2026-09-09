/**
 * Tipos auxiliares para los genéricos de los controllers de Express:
 *
 *   RequestHandler<Params, ResBody, ReqBody, ReqQuery>
 *
 * Express exige que `Params` sea un diccionario de strings, así que una ruta
 * sin parámetros no puede tiparse como `unknown`.
 */
export type NoParams = Record<string, string>

/** El cuerpo de la respuesta lo construyen los helpers de `lib/http`. */
export type NoBody = unknown
