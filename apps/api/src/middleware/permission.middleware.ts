import type { Role } from '@taskflow/contracts'
import type { NextFunction, Request, RequestHandler, Response } from 'express'

import { ForbiddenError } from '../lib/errors'
import { getAuthenticatedUser } from './auth.middleware'

/**
 * Autorización por rol: ¿qué puedes hacer?
 *
 * Sirve para permisos que dependen SOLO del rol (p. ej. una futura zona de
 * administración). Los permisos que dependen del recurso concreto —el
 * ownership de un proyecto o una tarea— no se pueden resolver aquí, porque
 * hace falta leer el recurso: eso vive en el service.
 */
export function requireRole(...roles: [Role, ...Role[]]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = getAuthenticatedUser(req)

    if (!roles.includes(user.role)) {
      next(new ForbiddenError())
      return
    }

    next()
  }
}
