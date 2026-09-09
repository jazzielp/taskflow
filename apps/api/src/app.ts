import { API_PREFIX, REQUEST_ID_HEADER } from '@taskflow/config'
import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'

import { env } from './config/env'
import { errorHandler } from './middleware/error.middleware'
import { notFound } from './middleware/not-found.middleware'
import { requestId } from './middleware/request-id.middleware'
import { requestLogger } from './middleware/request-logger.middleware'
import { apiRoutes } from './routes'

/**
 * Construye la aplicación Express.
 *
 * Se separa de `server.ts` (que es quien abre el puerto) para que los tests de
 * integración puedan lanzar peticiones con Supertest sin escuchar en ningún
 * puerto real.
 *
 * El ORDEN de los middlewares importa:
 *   1. seguridad y CORS
 *   2. identificador de request y log
 *   3. parseo del cuerpo
 *   4. rutas
 *   5. 404
 *   6. manejador global de errores (siempre el último)
 */
export function createApp(): Express {
  const app = express()

  // Necesario para que el rate limit y los logs vean la IP real detrás de un
  // proxy (nginx, Render, Fly...). Solo se confía en un salto.
  app.set('trust proxy', 1)

  app.disable('x-powered-by')
  app.use(helmet())
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
      exposedHeaders: [REQUEST_ID_HEADER],
    }),
  )

  app.use(requestId)
  app.use(requestLogger)

  app.use(express.json({ limit: '100kb' }))

  app.use(API_PREFIX, apiRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
