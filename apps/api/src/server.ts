// PRIMER import del proceso, a propósito: deja las variables de entorno
// cargadas antes de que se evalúe cualquier módulo que las necesite (el
// cliente de Prisma lee DATABASE_URL nada más importarse).
import './config/load-env'

import { prisma } from '@taskflow/database'

import { createApp } from './app'
import { env } from './config/env'
import { logger } from './lib/logger'

/**
 * Punto de entrada del proceso: abre el puerto y gestiona el apagado ordenado.
 * Toda la configuración de Express vive en `app.ts`.
 */
const app = createApp()

const server = app.listen(env.port, () => {
  logger.info('api_started', {
    port: env.port,
    env: env.nodeEnv,
    url: `http://localhost:${env.port}/api/health`,
  })
})

/**
 * Apagado ordenado: se deja de aceptar conexiones nuevas, se termina de servir
 * las que están en curso y se cierra el pool de la base de datos.
 */
async function shutdown(signal: string): Promise<void> {
  logger.info('api_shutting_down', { signal })

  server.close(() => {
    void prisma.$disconnect().then(() => process.exit(0))
  })

  // Si algo se queda colgado, no bloqueamos el despliegue indefinidamente.
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))
