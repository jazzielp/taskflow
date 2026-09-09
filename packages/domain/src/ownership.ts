import type { Role } from '@taskflow/contracts'

/** Lo mínimo que hace falta saber de quién intenta la operación. */
export type Actor = {
  id: string
  role: Role
}

/** Lo mínimo que hace falta saber del proyecto afectado. */
export type ProjectOwnership = {
  ownerId: string
}

/** ¿El actor es el propietario del proyecto? */
export function isProjectOwner(project: ProjectOwnership, actor: Actor): boolean {
  return project.ownerId === actor.id
}

/**
 * ¿El actor puede operar sobre el proyecto?
 * El propietario siempre puede; un ADMIN también.
 */
export function canManageProject(project: ProjectOwnership, actor: Actor): boolean {
  return isProjectOwner(project, actor) || actor.role === 'ADMIN'
}

/**
 * ¿El actor puede operar sobre una tarea?
 * Una tarea no tiene dueño propio: hereda el del proyecto que la contiene.
 */
export function canManageTask(project: ProjectOwnership, actor: Actor): boolean {
  return canManageProject(project, actor)
}
