import type { AuthSessionDto, LoginInput, RegisterInput, UserDto } from '@taskflow/contracts'

import { EmailAlreadyExistsError, InvalidCredentialsError } from '../../lib/errors'
import { signAccessToken } from '../../lib/jwt'
import { hashPassword, verifyPassword } from '../../lib/password'
import { toUserDto } from '../users/user.mapper'
import { userRepository } from '../users/user.repository'

/**
 * Lógica de autenticación.
 *
 * Este módulo no tiene repositorio propio: la única tabla que necesita es la de
 * usuarios, y esa vive en el módulo `users`. Añadir un `auth.repository` que
 * solo reenviara llamadas sería una capa vacía. El día que aparezcan sesiones
 * persistidas o refresh tokens, ahí sí habrá datos propios de auth.
 */
export const authService = {
  async register(input: RegisterInput): Promise<AuthSessionDto> {
    // Comprobación explícita para poder dar un error claro. La restricción
    // UNIQUE de la base de datos sigue siendo la garantía real ante una
    // condición de carrera (dos altas simultáneas con el mismo email): en ese
    // caso Prisma lanza P2002 y el middleware de errores lo traduce a 409.
    const existing = await userRepository.findByEmail(input.email)
    if (existing) throw new EmailAlreadyExistsError()

    const passwordHash = await hashPassword(input.password)
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    })

    return createSession(user)
  },

  async login(input: LoginInput): Promise<AuthSessionDto> {
    const user = await userRepository.findByEmail(input.email)

    // Mismo error tanto si el email no existe como si la contraseña falla:
    // así no se puede usar el login para averiguar qué emails están dados de
    // alta.
    if (!user) throw new InvalidCredentialsError()

    const passwordMatches = await verifyPassword(user.passwordHash, input.password)
    if (!passwordMatches) throw new InvalidCredentialsError()

    return createSession(user)
  },
}

function createSession(user: {
  id: string
  name: string
  email: string
  role: UserDto['role']
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}): AuthSessionDto {
  const { token, expiresIn } = signAccessToken(user)

  return {
    user: toUserDto(user),
    accessToken: token,
    expiresIn,
  }
}
