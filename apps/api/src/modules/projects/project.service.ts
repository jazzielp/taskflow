import type {
  CreateProjectInput,
  PaginationQuery,
  ProjectDto,
  UpdateProjectInput,
} from '@taskflow/contracts'
import { canManageProject, type Actor } from '@taskflow/domain'

import { ForbiddenError, ProjectNotFoundError } from '../../lib/errors'
import { toProjectDto } from './project.mapper'
import { projectRepository, type ProjectWithTaskCount } from './project.repository'

/**
 * Reglas de negocio de proyectos.
 *
 * La comprobación de ownership vive AQUÍ, en el servidor. Ocultar un botón en
 * el frontend es una decisión de interfaz; lo que impide de verdad que alguien
 * toque un proyecto ajeno es este archivo.
 */
export const projectService = {
  async list(
    actor: Actor,
    query: PaginationQuery,
  ): Promise<{ items: ProjectDto[]; total: number; page: number; limit: number }> {
    const { items, total } = await projectRepository.findManyByOwner({
      ownerId: actor.id,
      page: query.page,
      limit: query.limit,
    })

    return {
      items: items.map(toProjectDto),
      total,
      page: query.page,
      limit: query.limit,
    }
  },

  async getById(actor: Actor, projectId: string): Promise<ProjectDto> {
    const project = await loadOwnedProject(actor, projectId)
    return toProjectDto(project)
  },

  async create(actor: Actor, input: CreateProjectInput): Promise<ProjectDto> {
    const project = await projectRepository.create({
      ownerId: actor.id,
      name: input.name,
      description: input.description,
    })

    return toProjectDto(project)
  },

  async update(actor: Actor, projectId: string, input: UpdateProjectInput): Promise<ProjectDto> {
    await loadOwnedProject(actor, projectId)

    const project = await projectRepository.update(projectId, {
      name: input.name,
      description: input.description,
    })

    return toProjectDto(project)
  },

  async remove(actor: Actor, projectId: string): Promise<void> {
    await loadOwnedProject(actor, projectId)
    await projectRepository.delete(projectId)
  },
}

/**
 * Carga un proyecto comprobando que el actor puede operar sobre él.
 *
 * Se distingue entre "no existe" (404) y "existe pero no es tuyo" (403)
 * porque los identificadores son UUID: no se pueden adivinar, así que el
 * riesgo de filtrar su existencia es mínimo y el mensaje resultante es mucho
 * más útil al desarrollar. En una API pública con IDs secuenciales lo correcto
 * sería devolver 404 en ambos casos.
 */
export async function loadOwnedProject(
  actor: Actor,
  projectId: string,
): Promise<ProjectWithTaskCount> {
  const project = await projectRepository.findById(projectId)
  if (!project) throw new ProjectNotFoundError()

  if (!canManageProject(project, actor)) {
    throw new ForbiddenError('Este proyecto no te pertenece')
  }

  return project
}
