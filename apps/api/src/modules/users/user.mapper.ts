import type { UserDto } from '@taskflow/contracts'
import type { User } from '@taskflow/database'

/**
 * Traduce la fila de la base de datos al DTO público.
 *
 * Aquí es donde se garantiza que `passwordHash` NUNCA sale de la API: al
 * construir el objeto campo a campo, un campo nuevo y sensible en el modelo no
 * se filtra por accidente.
 */
export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}
