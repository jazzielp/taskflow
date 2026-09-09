import {
  createProjectSchema,
  idParamsSchema,
  paginationQuerySchema,
  updateProjectSchema,
  type PaginationQuery,
} from '@taskflow/contracts'
import { Router } from 'express'

import { authenticate } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validation.middleware'
import type { NoParams } from '../../types/http'
import { projectTasksRoutes } from '../tasks/task.routes'
import {
  createProjectController,
  deleteProjectController,
  getProjectController,
  listProjectsController,
  updateProjectController,
} from './project.controller'

const router: Router = Router()

// Todas las rutas de proyectos exigen sesión.
router.use(authenticate)

// Los genéricos van explícitos porque el middleware de validación transforma
// la query (`?page=2` llega como string y sale como número) y el tipo por
// defecto de Express asume que toda la query son strings.
router.get<NoParams, unknown, unknown, PaginationQuery>(
  '/',
  validate({ query: paginationQuerySchema }),
  listProjectsController,
)
router.post('/', validate({ body: createProjectSchema }), createProjectController)
router.get('/:id', validate({ params: idParamsSchema }), getProjectController)
router.patch(
  '/:id',
  validate({ params: idParamsSchema, body: updateProjectSchema }),
  updateProjectController,
)
router.delete('/:id', validate({ params: idParamsSchema }), deleteProjectController)

// Las tareas de un proyecto cuelgan de su proyecto:
//   GET/POST /api/projects/:projectId/tasks
router.use('/:projectId/tasks', projectTasksRoutes)

export { router as projectRoutes }
