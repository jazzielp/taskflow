import type { ApiList, ApiSuccess } from '@taskflow/contracts'
import type { Response } from 'express'

/**
 * Helpers para respetar siempre la convención de respuestas de la API:
 *
 *   { "data": ... }                         para un recurso
 *   { "data": [...], "meta": { total } }    para un listado
 *
 * Tener estos helpers evita que cada controller invente su propio formato.
 */

export function sendData<T>(res: Response, data: T, statusCode = 200): void {
  const body: ApiSuccess<T> = { data }
  res.status(statusCode).json(body)
}

export function sendCreated<T>(res: Response, data: T): void {
  sendData(res, data, 201)
}

export function sendList<T>(
  res: Response,
  data: T[],
  meta: { total: number; page: number; limit: number },
): void {
  const body: ApiList<T> = { data, meta }
  res.status(200).json(body)
}

export function sendNoContent(res: Response): void {
  res.status(204).end()
}
