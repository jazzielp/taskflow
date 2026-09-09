import type { NextFunction, Request, Response } from 'express'

import { logger } from '../lib/logger'

/**
 * Registra una línea por petición cuando la respuesta termina.
 *
 * Solo metadatos: nunca el cuerpo, ni cabeceras de autorización, ni cookies.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint()

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000

    logger.info('http_request', {
      requestId: req.requestId,
      userId: req.user?.id,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    })
  })

  next()
}
