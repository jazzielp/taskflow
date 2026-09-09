import { ERROR_CODES, type ApiError } from '@taskflow/contracts'
import { Prisma } from '@taskflow/database'
import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

import { AppError, EmailAlreadyExistsError, ValidationError } from '../lib/errors'
import { logger } from '../lib/logger'

/**
 * Middleware global de errores. Es el ÚNICO sitio donde se traduce un error a
 * una respuesta HTTP.
 *
 *   Service lanza ProjectNotFoundError  ->  aquí  ->  404 PROJECT_NOT_FOUND
 *
 * Express 5 reenvía automáticamente aquí las promesas rechazadas de los
 * handlers async, así que los controllers no necesitan try/catch.
 *
 * La firma DEBE tener cuatro parámetros: así es como Express reconoce un
 * manejador de errores.
 */
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = req.requestId
  const appError = toAppError(error)

  if (appError) {
    // Errores esperados: forman parte del contrato de la API.
    logger.debug('handled_error', {
      requestId,
      userId: req.user?.id,
      code: appError.code,
      statusCode: appError.statusCode,
    })

    const body: ApiError = {
      error: {
        code: appError.code,
        message: appError.message,
        ...(appError.details ? { details: appError.details } : {}),
        ...(requestId ? { requestId } : {}),
      },
    }

    res.status(appError.statusCode).json(body)
    return
  }

  // Lo que llega aquí es un fallo no previsto: se registra completo (con
  // stack) y se responde con un mensaje genérico. Nunca se filtran detalles
  // internos al cliente.
  logger.error('unhandled_error', {
    requestId,
    userId: req.user?.id,
    method: req.method,
    path: req.originalUrl,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  })

  const body: ApiError = {
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: 'Ha ocurrido un error inesperado',
      ...(requestId ? { requestId } : {}),
    },
  }

  res.status(500).json(body)
}

/** Normaliza los errores conocidos a un `AppError`. */
function toAppError(error: unknown): AppError | null {
  if (error instanceof AppError) return error

  // Un ZodError que llegue hasta aquí viene de una validación hecha fuera del
  // middleware (por ejemplo dentro de un service).
  if (error instanceof ZodError) {
    return new ValidationError(
      error.issues.map((issue) => ({
        path: issue.path.map(String).join('.'),
        message: issue.message,
      })),
    )
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: violación de una restricción UNIQUE.
    if (error.code === 'P2002') {
      const target = error.meta?.['target']
      const fields = Array.isArray(target) ? target.map(String) : []
      if (fields.includes('email')) return new EmailAlreadyExistsError()

      return new AppError('Ese valor ya está en uso', {
        statusCode: 409,
        code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
      })
    }

    // P2025: el registro que se intentaba modificar o borrar no existe.
    if (error.code === 'P2025') {
      return new AppError('El recurso no existe', {
        statusCode: 404,
        code: ERROR_CODES.NOT_FOUND,
      })
    }
  }

  return null
}
