import { Router } from 'express'

import { env } from '../config/env'
import { docsRoutes } from '../docs/docs.routes'
import { authRoutes } from '../modules/auth/auth.routes'
import { projectRoutes } from '../modules/projects/project.routes'
import { taskRoutes } from '../modules/tasks/task.routes'
import { healthRoutes } from './health.routes'

/**
 * Router raíz de la API. Se monta bajo `/api` en `app.ts`.
 * Aquí solo se decide qué módulo atiende cada prefijo.
 */
const router: Router = Router()

router.use(healthRoutes)
// La documentación publica la superficie completa de la API, así que en
// producción solo se sirve si se pide con `DOCS_ENABLED=true`.
if (env.docsEnabled) router.use(docsRoutes)
router.use('/auth', authRoutes)
router.use('/projects', projectRoutes)
router.use('/tasks', taskRoutes)

export { router as apiRoutes }
