import type { ListResult } from '@taskflow/api-client'
import type { CreateProjectInput, ProjectDto, UpdateProjectInput } from '@taskflow/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '../../lib/api'

/**
 * Claves de caché de TanStack Query.
 *
 * Se agrupan aquí para que invalidar sea explícito: `projectKeys.all` tumba
 * todo lo de proyectos, `projectKeys.detail(id)` solo uno.
 */
export const projectKeys = {
  all: ['projects'] as const,
  list: (page: number) => ['projects', 'list', page] as const,
  detail: (id: string) => ['projects', 'detail', id] as const,
}

export function useProjects(page = 1) {
  return useQuery<ListResult<ProjectDto>>({
    queryKey: projectKeys.list(page),
    queryFn: () => api.projects.list({ page }),
  })
}

export function useProject(id: string) {
  return useQuery<ProjectDto>({
    queryKey: projectKeys.detail(id),
    queryFn: () => api.projects.get(id),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProjectInput) => api.projects.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  })
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProjectInput) => api.projects.update(id, input),
    onSuccess: (project) => {
      queryClient.setQueryData(projectKeys.detail(id), project)
      return queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.projects.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  })
}
