import { Router } from 'express'

import { authRoutes } from '../modules/auth/auth.routes'
import { healthRoutes } from './health.routes'

/**
 * Router raíz de la API. Se monta bajo `/api` en `app.ts`.
 * Aquí solo se decide qué módulo atiende cada prefijo.
 */
const router: Router = Router()

router.use(healthRoutes)
router.use('/auth', authRoutes)

export { router as apiRoutes }
