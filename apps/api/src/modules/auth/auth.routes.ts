import { AUTH_RATE_LIMIT } from '@taskflow/config'
import { ERROR_CODES, loginSchema, registerSchema, type ApiError } from '@taskflow/contracts'
import { Router } from 'express'
import rateLimit from 'express-rate-limit'

import { env } from '../../config/env'
import { authenticate } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validation.middleware'
import {
  loginController,
  logoutController,
  meController,
  registerController,
} from './auth.controller'

/**
 * Las rutas solo declaran: método, URL, middlewares y controller.
 * Ninguna lógica de negocio.
 */
const router: Router = Router()

/**
 * Los endpoints de autenticación son el objetivo natural de un ataque de
 * fuerza bruta, así que se limitan por IP.
 */
const authRateLimit = rateLimit({
  windowMs: AUTH_RATE_LIMIT.windowMs,
  // En los tests se sube el techo: la batería registra muchos usuarios desde
  // la misma IP y no queremos que el límite haga fallar pruebas ajenas a él.
  limit: env.isTest ? 10_000 : AUTH_RATE_LIMIT.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => {
    const body: ApiError = {
      error: {
        code: ERROR_CODES.RATE_LIMITED,
        message: 'Demasiados intentos. Inténtalo de nuevo en unos minutos.',
      },
    }
    res.status(429).json(body)
  },
})

router.post('/register', authRateLimit, validate({ body: registerSchema }), registerController)
router.post('/login', authRateLimit, validate({ body: loginSchema }), loginController)
router.post('/logout', logoutController)
router.get('/me', authenticate, meController)

export { router as authRoutes }
