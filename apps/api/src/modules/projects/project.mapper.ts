import type { ProjectDto } from '@taskflow/contracts'

import type { ProjectWithTaskCount } from './project.repository'

export function toProjectDto(project: ProjectWithTaskCount): ProjectDto {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    ownerId: project.ownerId,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    taskCount: project._count.tasks,
  }
}
