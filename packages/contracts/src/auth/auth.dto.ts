import { z } from 'zod'

import { userDtoSchema } from '../users/user.dto'

/** Respuesta de `POST /auth/register` y `POST /auth/login`. */
export const authSessionDtoSchema = z
  .object({
    user: userDtoSchema,
    accessToken: z.string().meta({
      description: 'JWT a enviar en `Authorization: Bearer <token>`.',
    }),
    expiresIn: z.number().int().min(1).meta({
      description: 'Segundos de validez del token desde su emisión.',
      example: 604800,
    }),
  })
  .meta({ id: 'AuthSession', description: 'Sesión emitida tras registrarse o iniciar sesión.' })

export type AuthSessionDto = z.infer<typeof authSessionDtoSchema>

/**
 * Contenido del JWT emitido por la API. No forma parte del contrato HTTP
 * (el cliente trata el token como opaco), por eso no se documenta ni necesita
 * schema: solo lo usan la API y sus tests.
 */
export type AccessTokenPayload = {
  sub: string
  role: string
}
