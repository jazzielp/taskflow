import { z } from 'zod'

/** Roles del sistema. */
export const ROLES = ['USER', 'ADMIN'] as const
export const roleSchema = z.enum(ROLES)
export type Role = z.infer<typeof roleSchema>

/**
 * Estados válidos de una tarea.
 * El frontend NO puede inventar estados: la API solo acepta estos.
 */
export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const
export const taskStatusSchema = z.enum(TASK_STATUSES)
export type TaskStatus = z.infer<typeof taskStatusSchema>
