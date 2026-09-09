import { randomUUID } from 'node:crypto'

import { REQUEST_ID_HEADER } from '@taskflow/config'
import type { NextFunction, Request, Response } from 'express'

/**
 * Asigna un identificador único a cada petición.
 *
 * Se propaga al log y a la respuesta de error, de forma que si un usuario
 * reporta "me ha dado un 500", ese id lleva directamente a la traza concreta.
 * Si el cliente ya envía uno (típico detrás de un proxy), se respeta.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.get(REQUEST_ID_HEADER)
  const id = incoming && incoming.length <= 128 ? incoming : randomUUID()

  req.requestId = id
  res.setHeader(REQUEST_ID_HEADER, id)
  next()
}
