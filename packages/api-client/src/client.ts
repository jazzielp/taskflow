import {
  authSessionDtoSchema,
  projectDtoSchema,
  taskDtoSchema,
  userDtoSchema,
  type CreateProjectInput,
  type CreateTaskInput,
  type ListTasksQuery,
  type LoginInput,
  type PaginationQuery,
  type RegisterInput,
  type TaskStatus,
  type UpdateProjectInput,
  type UpdateTaskInput,
} from '@taskflow/contracts'

import { createHttp, type ApiClientOptions } from './http'

/**
 * Cliente HTTP de la API de TaskFlow, compartido por web y mobile.
 *
 * Solo sabe de contratos: no conoce React, ni el almacenamiento de la sesión,
 * ni el router. Quién guarda el token y qué se hace al perderlo se inyecta
 * desde fuera (`getToken`, `onUnauthenticated`), que es justo lo que cambia
 * entre la web y el móvil.
 */
export function createApiClient(options: ApiClientOptions) {
  const http = createHttp(options)

  return {
    auth: {
      register: (body: RegisterInput) =>
        http.request({
          method: 'POST',
          path: '/auth/register',
          body,
          schema: authSessionDtoSchema,
          auth: false,
        }),

      login: (body: LoginInput) =>
        http.request({
          method: 'POST',
          path: '/auth/login',
          body,
          schema: authSessionDtoSchema,
          auth: false,
        }),

      logout: () => http.requestEmpty({ method: 'POST', path: '/auth/logout' }),

      me: () => http.request({ method: 'GET', path: '/auth/me', schema: userDtoSchema }),
    },

    projects: {
      list: (query?: Partial<PaginationQuery>) =>
        http.requestList({ method: 'GET', path: '/projects', query, schema: projectDtoSchema }),

      get: (id: string) =>
        http.request({ method: 'GET', path: `/projects/${id}`, schema: projectDtoSchema }),

      create: (body: CreateProjectInput) =>
        http.request({ method: 'POST', path: '/projects', body, schema: projectDtoSchema }),

      update: (id: string, body: UpdateProjectInput) =>
        http.request({
          method: 'PATCH',
          path: `/projects/${id}`,
          body,
          schema: projectDtoSchema,
        }),

      remove: (id: string) => http.requestEmpty({ method: 'DELETE', path: `/projects/${id}` }),
    },

    tasks: {
      /** Las tareas se listan y se crean siempre dentro de su proyecto. */
      listByProject: (projectId: string, query?: Partial<ListTasksQuery>) =>
        http.requestList({
          method: 'GET',
          path: `/projects/${projectId}/tasks`,
          query,
          schema: taskDtoSchema,
        }),

      createInProject: (projectId: string, body: CreateTaskInput) =>
        http.request({
          method: 'POST',
          path: `/projects/${projectId}/tasks`,
          body,
          schema: taskDtoSchema,
        }),

      get: (id: string) =>
        http.request({ method: 'GET', path: `/tasks/${id}`, schema: taskDtoSchema }),

      update: (id: string, body: UpdateTaskInput) =>
        http.request({ method: 'PATCH', path: `/tasks/${id}`, body, schema: taskDtoSchema }),

      /**
       * Endpoint propio para el cambio de estado: mover una tarea por el
       * tablero no es lo mismo que editarla, y el backend aplica aquí las
       * transiciones permitidas.
       */
      updateStatus: (id: string, status: TaskStatus) =>
        http.request({
          method: 'PATCH',
          path: `/tasks/${id}/status`,
          body: { status },
          schema: taskDtoSchema,
        }),

      remove: (id: string) => http.requestEmpty({ method: 'DELETE', path: `/tasks/${id}` }),
    },
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
