import type { NextFunction, Request, Response } from 'express'

import { RouteNotFoundError } from '../lib/errors'

/**
 * Se monta después de todas las rutas: si la petición llega aquí, no existe.
 * Delega en el middleware de errores para responder con el mismo formato
 * que cualquier otro error de la API.
 */
export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new RouteNotFoundError(`No existe la ruta ${req.method} ${req.originalUrl}`))
}
