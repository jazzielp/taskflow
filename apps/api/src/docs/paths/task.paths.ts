import { ALLOWED_TASK_STATUS_TRANSITIONS } from '@taskflow/domain'

import { errors } from '../components'
import { dataOf, jsonBody, jsonResponse, listOf, noContent, schemaRef } from '../helpers'
import type { PathsObject, Ref } from '../types'

export const TASK_TAG = 'Tareas'

const idPath: Ref = { $ref: '#/components/parameters/IdPath' }
const projectIdPath: Ref = { $ref: '#/components/parameters/ProjectIdPath' }
const pageQuery: Ref = { $ref: '#/components/parameters/PageQuery' }
const limitQuery: Ref = { $ref: '#/components/parameters/LimitQuery' }
const statusQuery: Ref = { $ref: '#/components/parameters/TaskStatusQuery' }

/**
 * Las tareas se exponen en dos sitios, y cada uno tiene su motivo:
 *
 *   /projects/{projectId}/tasks   listar y crear (una tarea siempre nace
 *                                 dentro de un proyecto concreto)
 *   /tasks/{id}                   leer, editar y borrar una tarea concreta
 *                                 (el id ya identifica el recurso; repetir el
 *                                 proyecto en la URL sería redundante)
 */
export const taskPaths: PathsObject = {
  '/projects/{projectId}/tasks': {
    get: {
      operationId: 'listProjectTasks',
      tags: [TASK_TAG],
      summary: 'Listar las tareas de un proyecto',
      parameters: [projectIdPath, pageQuery, limitQuery, statusQuery],
      responses: {
        '200': jsonResponse('Página de tareas.', listOf(schemaRef('Task'))),
        ...errors('Unauthenticated', 'Forbidden', 'ProjectNotFound', 'ValidationError'),
      },
    },
    post: {
      operationId: 'createProjectTask',
      tags: [TASK_TAG],
      summary: 'Crear una tarea en un proyecto',
      parameters: [projectIdPath],
      requestBody: jsonBody(schemaRef('CreateTaskInput')),
      responses: {
        '201': jsonResponse('Tarea creada.', dataOf(schemaRef('Task'))),
        ...errors('Unauthenticated', 'Forbidden', 'ProjectNotFound', 'ValidationError'),
      },
    },
  },

  '/tasks/{id}': {
    get: {
      operationId: 'getTask',
      tags: [TASK_TAG],
      summary: 'Obtener una tarea',
      parameters: [idPath],
      responses: {
        '200': jsonResponse('Tarea solicitada.', dataOf(schemaRef('Task'))),
        ...errors('Unauthenticated', 'Forbidden', 'TaskNotFound', 'ValidationError'),
      },
    },
    patch: {
      operationId: 'updateTask',
      tags: [TASK_TAG],
      summary: 'Modificar una tarea',
      description:
        'Actualización parcial: solo se tocan los campos enviados. El cuerpo no puede venir vacío.',
      parameters: [idPath],
      requestBody: jsonBody(schemaRef('UpdateTaskInput')),
      responses: {
        '200': jsonResponse('Tarea actualizada.', dataOf(schemaRef('Task'))),
        ...errors(
          'Unauthenticated',
          'Forbidden',
          'TaskNotFound',
          'ValidationError',
          'InvalidStatusTransition',
        ),
      },
    },
    delete: {
      operationId: 'deleteTask',
      tags: [TASK_TAG],
      summary: 'Eliminar una tarea',
      parameters: [idPath],
      responses: {
        '204': noContent('Tarea eliminada.'),
        ...errors('Unauthenticated', 'Forbidden', 'TaskNotFound', 'ValidationError'),
      },
    },
  },

  '/tasks/{id}/status': {
    patch: {
      operationId: 'updateTaskStatus',
      tags: [TASK_TAG],
      summary: 'Cambiar el estado de una tarea',
      description: `Endpoint dedicado porque el cambio de estado tiene reglas propias: no toda transición está permitida.\n\n${transitionsTable()}`,
      parameters: [idPath],
      requestBody: jsonBody(schemaRef('UpdateTaskStatusInput')),
      responses: {
        '200': jsonResponse('Estado actualizado.', dataOf(schemaRef('Task'))),
        ...errors(
          'Unauthenticated',
          'Forbidden',
          'TaskNotFound',
          'ValidationError',
          'InvalidStatusTransition',
        ),
      },
    },
  },
}

/**
 * La tabla de transiciones se genera desde `@taskflow/domain` en lugar de
 * escribirse a mano: si mañana se permite una transición nueva, la
 * documentación cambia sola.
 */
function transitionsTable(): string {
  const rows = Object.entries(ALLOWED_TASK_STATUS_TRANSITIONS).map(
    ([from, to]) => `| \`${from}\` | ${to.map((status) => `\`${status}\``).join(', ')} |`,
  )

  return ['Transiciones permitidas:', '', '| Desde | Hacia |', '| --- | --- |', ...rows].join('\n')
}
