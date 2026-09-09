import type { LoginInput, RegisterInput } from '@taskflow/contracts'
import type { RequestHandler } from 'express'

import type { NoParams } from '../../types/http'

import { sendCreated, sendData, sendNoContent } from '../../lib/http'
import { getAuthenticatedUser } from '../../middleware/auth.middleware'
import { userService } from '../users/user.service'
import { authService } from './auth.service'

/**
 * Los controllers solo hacen tres cosas:
 *   1. leer lo que necesitan de `req` (ya validado por el middleware),
 *   2. llamar al service,
 *   3. traducir el resultado a una respuesta HTTP.
 *
 * No consultan Prisma ni aplican reglas de negocio.
 */

export const registerController: RequestHandler<NoParams, unknown, RegisterInput> = async (
  req,
  res,
) => {
  const session = await authService.register(req.body)
  sendCreated(res, session)
}

export const loginController: RequestHandler<NoParams, unknown, LoginInput> = async (req, res) => {
  const session = await authService.login(req.body)
  sendData(res, session)
}

export const meController: RequestHandler = async (req, res) => {
  const actor = getAuthenticatedUser(req)
  const user = await userService.getById(actor.id)
  sendData(res, user)
}

/**
 * Con JWT el estado de sesión vive en el cliente, así que cerrar sesión es
 * descartar el token. El endpoint existe igualmente para que web y mobile
 * tengan un punto único al que llamar (y para poder invalidar cookies o
 * refresh tokens el día que se añadan).
 */
export const logoutController: RequestHandler = (_req, res) => {
  sendNoContent(res)
}
