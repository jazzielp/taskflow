import type { UserDto } from '@taskflow/contracts'

import { UserNotFoundError } from '../../lib/errors'
import { toUserDto } from './user.mapper'
import { userRepository } from './user.repository'

/**
 * Lógica de negocio relacionada con usuarios.
 * No conoce `req`, `res` ni `next`: se puede llamar desde un controller, desde
 * un script o desde un test sin levantar el servidor.
 */
export const userService = {
  async getById(userId: string): Promise<UserDto> {
    const user = await userRepository.findById(userId)
    if (!user) throw new UserNotFoundError()

    return toUserDto(user)
  },
}
