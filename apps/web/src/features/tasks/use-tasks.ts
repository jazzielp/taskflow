import type { ListResult } from '@taskflow/api-client'
import type { CreateTaskInput, TaskDto, TaskStatus, UpdateTaskInput } from '@taskflow/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '../../lib/api'
import { projectKeys } from '../projects/use-projects'

export const taskKeys = {
  all: ['tasks'] as const,
  byProject: (projectId: string) => ['tasks', 'project', projectId] as const,
}

/**
 * El tablero necesita todas las tareas a la vez para repartirlas por columnas,
 * así que pide el tamaño máximo de página que admite la API. Por encima de ese
 * número el tablero se quedaría corto: haría falta paginar por columna.
 */
const BOARD_PAGE_SIZE = 100

export function useProjectTasks(projectId: string) {
  return useQuery<ListResult<TaskDto>>({
    queryKey: taskKeys.byProject(projectId),
    queryFn: () => api.tasks.listByProject(projectId, { limit: BOARD_PAGE_SIZE }),
  })
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTaskInput) => api.tasks.createInProject(projectId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) })
      // El contador de tareas del proyecto acaba de cambiar.
      await queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      api.tasks.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) }),
  })
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.tasks.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) })
      await queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

/**
 * Mover una tarea de columna se aplica de forma optimista: la tarjeta salta en
 * cuanto se pulsa y solo vuelve atrás si la API rechaza el cambio. Es la
 * interacción principal del tablero y esperar a la red la haría sentir lenta.
 *
 * La transición ya se ha filtrado en la UI con las reglas de @taskflow/domain,
 * así que el rechazo es el caso raro: normalmente significa que otra persona
 * movió la misma tarea antes.
 */
export function useUpdateTaskStatus(projectId: string) {
  const queryClient = useQueryClient()
  const key = taskKeys.byProject(projectId)

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      api.tasks.updateStatus(id, status),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<ListResult<TaskDto>>(key)

      if (previous) {
        queryClient.setQueryData<ListResult<TaskDto>>(key, {
          ...previous,
          data: previous.data.map((task) => (task.id === id ? { ...task, status } : task)),
        })
      }
      return { previous }
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}
