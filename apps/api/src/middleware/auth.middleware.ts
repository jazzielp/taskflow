import { AUTH_SCHEME } from '@taskflow/config'
import { roleSchema } from '@taskflow/contracts'
import type { NextFunction, Request, Response } from 'express'

import { UnauthenticatedError } from '../lib/errors'
import { verifyAccessToken } from '../lib/jwt'
import type { AuthenticatedUser } from '../types/express'

/**
 * Autenticación: ¿quién eres?
 *
 * Lee el token de `Authorization: Bearer <token>`, lo verifica y deja el
 * usuario en `req.user`. No decide permisos: de eso se encarga la autorización.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.get('authorization')

  if (!header?.startsWith(`${AUTH_SCHEME} `)) {
    next(new UnauthenticatedError())
    return
  }

  const token = header.slice(AUTH_SCHEME.length + 1).trim()
  const payload = verifyAccessToken(token)

  if (!payload) {
    next(new UnauthenticatedError('Tu sesión no es válida o ha caducado'))
    return
  }

  const role = roleSchema.safeParse(payload.role)
  if (!role.success) {
    next(new UnauthenticatedError('Tu sesión no es válida o ha caducado'))
    return
  }

  req.user = { id: payload.sub, role: role.data }
  next()
}

/**
 * Devuelve el usuario autenticado o falla.
 *
 * Los controllers lo usan en lugar de `req.user!`: deja explícita la invariante
 * ("esta ruta va detrás de `authenticate`") sin recurrir a un cast.
 *
 * Acepta cualquier objeto con `user` en lugar de un `Request` concreto: los
 * controllers tipan sus genéricos (params, body, query) y un `Request<...>`
 * personalizado no es asignable al `Request` por defecto.
 */
export function getAuthenticatedUser(req: { user?: AuthenticatedUser }): AuthenticatedUser {
  if (!req.user) throw new UnauthenticatedError()
  return req.user
}
