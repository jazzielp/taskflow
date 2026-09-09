import type { TaskStatus } from '@taskflow/contracts'

/**
 * Transiciones permitidas entre estados de una tarea.
 *
 *   TODO        -> IN_PROGRESS | DONE
 *   IN_PROGRESS -> TODO        | DONE
 *   DONE        -> IN_PROGRESS
 *
 * Una tarea terminada se puede reabrir, pero vuelve a "en progreso":
 * no tiene sentido devolverla a "por hacer" como si nunca se hubiera trabajado.
 * Tampoco se permite pasar una tarea a su estado actual: no es un cambio.
 */
export const ALLOWED_TASK_STATUS_TRANSITIONS: Readonly<Record<TaskStatus, readonly TaskStatus[]>> = {
  TODO: ['IN_PROGRESS', 'DONE'],
  IN_PROGRESS: ['TODO', 'DONE'],
  DONE: ['IN_PROGRESS'],
}

/** ¿Se puede mover una tarea de `current` a `next`? */
export function canMoveTaskToStatus(current: TaskStatus, next: TaskStatus): boolean {
  return ALLOWED_TASK_STATUS_TRANSITIONS[current].includes(next)
}

/** Estados a los que se puede mover una tarea desde `current`. */
export function nextStatusesFor(current: TaskStatus): readonly TaskStatus[] {
  return ALLOWED_TASK_STATUS_TRANSITIONS[current]
}
