import { Router } from 'express'

import { authRoutes } from '../modules/auth/auth.routes'
import { projectRoutes } from '../modules/projects/project.routes'
import { healthRoutes } from './health.routes'

/**
 * Router raíz de la API. Se monta bajo `/api` en `app.ts`.
 * Aquí solo se decide qué módulo atiende cada prefijo.
 */
const router: Router = Router()

router.use(healthRoutes)
router.use('/auth', authRoutes)
router.use('/projects', projectRoutes)

export { router as apiRoutes }
