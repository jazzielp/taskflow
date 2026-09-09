import type { UserDto } from '../users/user.dto'

/** Respuesta de `POST /auth/register` y `POST /auth/login`. */
export type AuthSessionDto = {
  user: UserDto
  accessToken: string
  expiresIn: number
}

/** Contenido del JWT emitido por la API. */
export type AccessTokenPayload = {
  sub: string
  role: string
}
