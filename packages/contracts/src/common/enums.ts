import { z } from 'zod'

/**
 * Los `.meta({ id })` no son decorativos: son lo que hace que este schema
 * aparezca como un componente reutilizable en la documentación OpenAPI
 * (`#/components/schemas/Role`) en lugar de duplicarse en cada endpoint.
 * Ver `apps/api/src/docs`.
 */

/** Roles del sistema. */
export const ROLES = ['USER', 'ADMIN'] as const
export const roleSchema = z.enum(ROLES).meta({
  id: 'Role',
  description: 'Rol del usuario dentro del sistema.',
})
export type Role = z.infer<typeof roleSchema>

/**
 * Estados válidos de una tarea.
 * El frontend NO puede inventar estados: la API solo acepta estos.
 */
export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const
export const taskStatusSchema = z.enum(TASK_STATUSES).meta({
  id: 'TaskStatus',
  description: 'Estado de una tarea dentro de su flujo de trabajo.',
})
export type TaskStatus = z.infer<typeof taskStatusSchema>
