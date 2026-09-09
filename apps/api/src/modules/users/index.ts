/**
 * Módulo `users`.
 *
 * No expone rutas propias: el perfil del usuario autenticado se sirve desde
 * `GET /api/auth/me`. Lo que sí concentra es el acceso a la tabla de usuarios,
 * que el módulo `auth` reutiliza en lugar de duplicar sus propias consultas.
 */
export { toUserDto } from './user.mapper'
export { userRepository } from './user.repository'
export { userService } from './user.service'
