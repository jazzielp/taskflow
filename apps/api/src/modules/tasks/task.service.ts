import type {
  CreateTaskInput,
  ListTasksQuery,
  TaskDto,
  TaskStatus,
  UpdateTaskInput,
} from '@taskflow/contracts'
import { canManageTask, canMoveTaskToStatus, nextStatusesFor, type Actor } from '@taskflow/domain'

import { ForbiddenError, InvalidStatusTransitionError, TaskNotFoundError } from '../../lib/errors'
import { loadOwnedProject } from '../projects/project.service'
import { toTaskDto } from './task.mapper'
import { taskRepository, type TaskWithProjectOwner } from './task.repository'

/**
 * Reglas de negocio de tareas.
 *
 * Una tarea no tiene propietario propio: hereda el del proyecto. Por eso todas
 * las operaciones empiezan cargando el proyecto y comprobando el permiso sobre
 * él. Es exactamente la regla del enunciado:
 *
 *     task.project.ownerId === authenticatedUser.id
 */
export const taskService = {
  async listByProject(
    actor: Actor,
    projectId: string,
    query: ListTasksQuery,
  ): Promise<{ items: TaskDto[]; total: number; page: number; limit: number }> {
    // Comprueba a la vez que el proyecto existe y que el actor puede verlo.
    await loadOwnedProject(actor, projectId)

    const { items, total } = await taskRepository.findManyByProject({
      projectId,
      page: query.page,
      limit: query.limit,
      status: query.status,
    })

    return { items: items.map(toTaskDto), total, page: query.page, limit: query.limit }
  },

  async create(actor: Actor, projectId: string, input: CreateTaskInput): Promise<TaskDto> {
    await loadOwnedProject(actor, projectId)

    const task = await taskRepository.create({
      projectId,
      title: input.title,
      description: input.description,
      status: input.status,
    })

    return toTaskDto(task)
  },

  async getById(actor: Actor, taskId: string): Promise<TaskDto> {
    const task = await loadManageableTask(actor, taskId)
    return toTaskDto(task)
  },

  async update(actor: Actor, taskId: string, input: UpdateTaskInput): Promise<TaskDto> {
    const current = await loadManageableTask(actor, taskId)

    if (input.status !== undefined) {
      assertStatusTransition(current.status, input.status)
    }

    const task = await taskRepository.update(taskId, {
      title: input.title,
      description: input.description,
      status: input.status,
    })

    return toTaskDto(task)
  },

  async updateStatus(actor: Actor, taskId: string, status: TaskStatus): Promise<TaskDto> {
    const current = await loadManageableTask(actor, taskId)
    assertStatusTransition(current.status, status)

    const task = await taskRepository.update(taskId, { status })
    return toTaskDto(task)
  },

  async remove(actor: Actor, taskId: string): Promise<void> {
    await loadManageableTask(actor, taskId)
    await taskRepository.delete(taskId)
  },
}

async function loadManageableTask(actor: Actor, taskId: string): Promise<TaskWithProjectOwner> {
  const task = await taskRepository.findById(taskId)
  if (!task) throw new TaskNotFoundError()

  if (!canManageTask(task.project, actor)) {
    throw new ForbiddenError('Esta tarea pertenece a un proyecto que no es tuyo')
  }

  return task
}

/**
 * La regla de qué transiciones son válidas vive en `@taskflow/domain`
 * (TypeScript puro, sin dependencias). El service solo la aplica y traduce el
 * "no" a un error de dominio.
 */
function assertStatusTransition(current: TaskStatus, next: TaskStatus): void {
  if (canMoveTaskToStatus(current, next)) return

  const allowed = nextStatusesFor(current)
  throw new InvalidStatusTransitionError(
    allowed.length > 0
      ? `No se puede pasar una tarea de ${current} a ${next}. Estados posibles: ${allowed.join(', ')}.`
      : `No se puede cambiar el estado de una tarea en ${current}.`,
  )
}
