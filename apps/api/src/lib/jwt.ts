import type { AccessTokenPayload, Role } from '@taskflow/contracts'
import jwt from 'jsonwebtoken'

import { env } from '../config/env'

export type AccessToken = {
  token: string
  /** Segundos hasta la expiración, para que el cliente sepa cuándo renovar. */
  expiresIn: number
}

/** Firma un token de acceso para un usuario. */
export function signAccessToken(user: { id: string; role: Role }): AccessToken {
  const token = jwt.sign({ role: user.role }, env.jwt.secret, {
    subject: user.id,
    expiresIn: env.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  })

  const decoded = jwt.decode(token)
  const expiresIn =
    decoded !== null && typeof decoded === 'object' && typeof decoded.exp === 'number'
      ? decoded.exp - Math.floor(Date.now() / 1000)
      : 0

  return { token, expiresIn }
}

/**
 * Verifica un token y devuelve su payload.
 * Devuelve `null` si el token es inválido, ha caducado o está manipulado:
 * quien llama decide qué error de dominio lanzar.
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const payload = jwt.verify(token, env.jwt.secret)

    if (typeof payload === 'string' || typeof payload.sub !== 'string') return null
    if (typeof payload['role'] !== 'string') return null

    return { sub: payload.sub, role: payload['role'] }
  } catch {
    return null
  }
}
