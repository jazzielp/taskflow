import { Router } from 'express'

import { healthRoutes } from './health.routes'

/**
 * Router raíz de la API. Se monta bajo `/api` en `app.ts`.
 * Aquí solo se decide qué módulo atiende cada prefijo.
 */
const router: Router = Router()

router.use(healthRoutes)

export { router as apiRoutes }
