import { ERROR_CODES } from '@taskflow/contracts'
import { describe, expect, it } from 'vitest'

import { ApiClientError, fieldErrorsOf } from './errors'

describe('fieldErrorsOf', () => {
  it('quita el origen de la ruta para dejar el nombre del campo', () => {
    const error = new ApiClientError({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Datos inválidos',
      status: 422,
      details: [
        { path: 'body.email', message: 'Introduce un email válido' },
        { path: 'body.password', message: 'Demasiado corta' },
      ],
    })

    expect(fieldErrorsOf(error)).toEqual({
      email: 'Introduce un email válido',
      password: 'Demasiado corta',
    })
  })

  it('se queda con el primer mensaje cuando un campo falla por varios motivos', () => {
    const error = new ApiClientError({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Datos inválidos',
      details: [
        { path: 'body.email', message: 'primero' },
        { path: 'body.email', message: 'segundo' },
      ],
    })

    expect(fieldErrorsOf(error).email).toBe('primero')
  })

  it('conserva la ruta entera si no lleva prefijo de origen', () => {
    const error = new ApiClientError({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Datos inválidos',
      details: [{ path: 'email', message: 'Introduce un email válido' }],
    })

    expect(fieldErrorsOf(error).email).toBe('Introduce un email válido')
  })

  it('devuelve un mapa vacío para lo que no es un error de validación', () => {
    expect(fieldErrorsOf(new Error('boom'))).toEqual({})
    expect(
      fieldErrorsOf(
        new ApiClientError({ code: ERROR_CODES.UNAUTHENTICATED, message: 'Sin sesión' }),
      ),
    ).toEqual({})
  })
})

describe('ApiClientError', () => {
  it('marca la falta de sesión para que la app pueda reaccionar', () => {
    const error = new ApiClientError({
      code: ERROR_CODES.UNAUTHENTICATED,
      message: 'Sin sesión',
      status: 401,
    })

    expect(error.isUnauthenticated).toBe(true)
    expect(error.isValidationError).toBe(false)
  })

  it('usa status 0 cuando la petición no llegó a la API', () => {
    expect(new ApiClientError({ code: 'NETWORK_ERROR', message: 'Sin red' }).status).toBe(0)
  })
})
