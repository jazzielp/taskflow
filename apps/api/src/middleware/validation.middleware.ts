import type { ApiErrorDetail } from '@taskflow/contracts'
import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type { ParamsDictionary, Query } from 'express-serve-static-core'
import type { ZodType } from 'zod'

import { ValidationError } from '../lib/errors'

/**
 * Middleware de validación.
 *
 * Regla 5 de la arquitectura: TODA entrada externa se valida (body, params y
 * query). El frontend también valida, pero eso es UX; esto es seguridad.
 *
 * Además de comprobar, el schema NORMALIZA (recorta espacios, pasa el email a
 * minúsculas, convierte los números de la query...). Por eso se reemplaza el
 * valor original por el ya parseado: a partir de aquí, el resto de la
 * aplicación trabaja con datos limpios y tipados.
 */
export type ValidationSchemas = {
  body?: ZodType
  params?: ZodType
  query?: ZodType
}

/**
 * Los genéricos permiten que el handler devuelto encaje con el tipo que espera
 * cada ruta. Son los mismos que los de `RequestHandler`, en el mismo orden:
 * params, cuerpo de la respuesta, cuerpo de la petición y query.
 */
export function validate<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Query,
>(schemas: ValidationSchemas): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  const handler = (req: Request, _res: Response, next: NextFunction): void => {
    const details: ApiErrorDetail[] = []

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params)
      if (result.success) req.params = result.data as typeof req.params
      else details.push(...toDetails(result.error.issues, 'params'))
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query)
      if (result.success) {
        // En Express 5 `req.query` es un getter y no se puede asignar
        // directamente; hay que redefinir la propiedad.
        Object.defineProperty(req, 'query', { value: result.data, writable: true })
      } else {
        details.push(...toDetails(result.error.issues, 'query'))
      }
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body)
      if (result.success) req.body = result.data
      else details.push(...toDetails(result.error.issues, 'body'))
    }

    if (details.length > 0) {
      next(new ValidationError(details))
      return
    }

    next()
  }

  // El middleware trabaja siempre con el `Request` genérico de Express; el tipo
  // concreto lo aporta el schema y se refleja en la firma pública de `validate`.
  return handler as RequestHandler<P, ResBody, ReqBody, ReqQuery>
}

type Issue = { path: PropertyKey[]; message: string }

function toDetails(issues: readonly Issue[], source: string): ApiErrorDetail[] {
  return issues.map((issue) => ({
    path: [source, ...issue.path.map(String)].join('.'),
    message: issue.message,
  }))
}
