import {
  createTaskSchema,
  idParamsSchema,
  listTasksQuerySchema,
  projectIdParamsSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  type ListTasksQuery,
  type ProjectIdParams,
} from '@taskflow/contracts'
import { Router } from 'express'

import { authenticate } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validation.middleware'
import {
  createProjectTaskController,
  deleteTaskController,
  getTaskController,
  listProjectTasksController,
  updateTaskController,
  updateTaskStatusController,
} from './task.controller'

/**
 * Las tareas se exponen en dos sitios, y cada uno tiene su motivo:
 *
 *   /api/projects/:projectId/tasks   listar y crear (una tarea siempre nace
 *                                    dentro de un proyecto concreto)
 *   /api/tasks/:id                   leer, editar y borrar una tarea concreta
 *                                    (el id ya identifica el recurso, repetir
 *                                    el proyecto en la URL sería redundante)
 */

// `mergeParams` hace visible `:projectId` del router padre.
const projectTasksRouter: Router = Router({ mergeParams: true })

// Genéricos explícitos: la query ya viene parseada por `validate`.
projectTasksRouter.get<ProjectIdParams, unknown, unknown, ListTasksQuery>(
  '/',
  validate({ params: projectIdParamsSchema, query: listTasksQuerySchema }),
  listProjectTasksController,
)
projectTasksRouter.post(
  '/',
  validate({ params: projectIdParamsSchema, body: createTaskSchema }),
  createProjectTaskController,
)

const taskRouter: Router = Router()

taskRouter.use(authenticate)

taskRouter.get('/:id', validate({ params: idParamsSchema }), getTaskController)
taskRouter.patch(
  '/:id',
  validate({ params: idParamsSchema, body: updateTaskSchema }),
  updateTaskController,
)
taskRouter.patch(
  '/:id/status',
  validate({ params: idParamsSchema, body: updateTaskStatusSchema }),
  updateTaskStatusController,
)
taskRouter.delete('/:id', validate({ params: idParamsSchema }), deleteTaskController)

export { projectTasksRouter as projectTasksRoutes, taskRouter as taskRoutes }
