/**
 * @taskflow/domain
 *
 * Reglas de negocio PURAS: funciones sin efectos, sin I/O y sin dependencias
 * de plataforma. No importa Express, React, React Native ni Prisma.
 *
 * La única dependencia es `@taskflow/contracts`, y solo para reutilizar tipos
 * (`import type`, que TypeScript borra al compilar). Así no se duplican los
 * tipos del dominio en dos sitios.
 *
 * Estas funciones se pueden probar con un test unitario trivial, y por eso son
 * el mejor sitio para las reglas que deben ser siempre ciertas.
 */
export {
  ALLOWED_TASK_STATUS_TRANSITIONS,
  canMoveTaskToStatus,
  nextStatusesFor,
} from './task-status'
export { canManageProject, canManageTask, isProjectOwner } from './ownership'
export type { ProjectOwnership, Actor } from './ownership'
