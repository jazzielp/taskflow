import type { Role } from '../common/enums'

/**
 * Representación pública de un usuario.
 * NUNCA incluye `passwordHash`: lo que sale de la API es lo que ve el cliente.
 */
export type UserDto = {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
  updatedAt: string
}
