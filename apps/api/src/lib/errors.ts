import { ERROR_CODES, type ApiErrorDetail, type ErrorCode } from '@taskflow/contracts'

/**
 * Errores de dominio.
 *
 * Los services LANZAN estos errores; no saben nada de HTTP.
 * El middleware global de errores es el único que decide qué código HTTP
 * corresponde a cada uno. Así la lógica de negocio queda independiente del
 * transporte y se puede probar sin levantar un servidor.
 */
export class AppError extends Error {
  readonly statusCode: number
  readonly code: ErrorCode
  readonly details: ApiErrorDetail[] | undefined

  constructor(
    message: string,
    options: { statusCode: number; code: ErrorCode; details?: ApiErrorDetail[] },
  ) {
    super(message)
    this.name = new.target.name
    this.statusCode = options.statusCode
    this.code = options.code
    this.details = options.details
  }
}

/** 401 — no hay sesión válida. */
export class UnauthenticatedError extends AppError {
  constructor(message = 'Necesitas iniciar sesión') {
    super(message, { statusCode: 401, code: ERROR_CODES.UNAUTHENTICATED })
  }
}

/** 401 — email o contraseña incorrectos (mensaje deliberadamente ambiguo). */
export class InvalidCredentialsError extends AppError {
  constructor(message = 'Email o contraseña incorrectos') {
    super(message, { statusCode: 401, code: ERROR_CODES.INVALID_CREDENTIALS })
  }
}

/** 409 — el email ya está registrado. */
export class EmailAlreadyExistsError extends AppError {
  constructor(message = 'Ya existe una cuenta con ese email') {
    super(message, { statusCode: 409, code: ERROR_CODES.EMAIL_ALREADY_EXISTS })
  }
}

/** 403 — hay sesión, pero no permiso sobre este recurso. */
export class ForbiddenError extends AppError {
  constructor(message = 'No tienes permiso para realizar esta acción') {
    super(message, { statusCode: 403, code: ERROR_CODES.FORBIDDEN })
  }
}

export class ProjectNotFoundError extends AppError {
  constructor(message = 'Proyecto no encontrado') {
    super(message, { statusCode: 404, code: ERROR_CODES.PROJECT_NOT_FOUND })
  }
}

export class TaskNotFoundError extends AppError {
  constructor(message = 'Tarea no encontrada') {
    super(message, { statusCode: 404, code: ERROR_CODES.TASK_NOT_FOUND })
  }
}

export class UserNotFoundError extends AppError {
  constructor(message = 'Usuario no encontrado') {
    super(message, { statusCode: 404, code: ERROR_CODES.USER_NOT_FOUND })
  }
}

/** 422 — el cambio de estado solicitado no está permitido por el dominio. */
export class InvalidStatusTransitionError extends AppError {
  constructor(message: string) {
    super(message, { statusCode: 422, code: ERROR_CODES.INVALID_STATUS_TRANSITION })
  }
}

/** 422 — la entrada no cumple el contrato. */
export class ValidationError extends AppError {
  constructor(details: ApiErrorDetail[], message = 'Los datos enviados no son válidos') {
    super(message, { statusCode: 422, code: ERROR_CODES.VALIDATION_ERROR, details })
  }
}

/** 404 — ruta inexistente. */
export class RouteNotFoundError extends AppError {
  constructor(message = 'Ruta no encontrada') {
    super(message, { statusCode: 404, code: ERROR_CODES.NOT_FOUND })
  }
}
