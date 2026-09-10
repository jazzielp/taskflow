import { errors } from '../components'
import { dataOf, jsonBody, jsonResponse, noContent, schemaRef } from '../helpers'
import type { PathsObject } from '../types'

export const AUTH_TAG = 'Autenticación'

/**
 * `register`, `login` y `logout` son públicos, así que anulan la seguridad
 * global del documento con `security: []`.
 */
export const authPaths: PathsObject = {
  '/auth/register': {
    post: {
      operationId: 'register',
      tags: [AUTH_TAG],
      summary: 'Crear una cuenta',
      description:
        'Registra un usuario y devuelve una sesión ya iniciada, para que el cliente no tenga que encadenar un login.\n\nLimitado por IP para frenar los ataques de fuerza bruta.',
      security: [],
      requestBody: jsonBody(schemaRef('RegisterInput')),
      responses: {
        '201': jsonResponse('Cuenta creada y sesión iniciada.', dataOf(schemaRef('AuthSession'))),
        ...errors('ValidationError', 'EmailAlreadyExists', 'RateLimited'),
      },
    },
  },

  '/auth/login': {
    post: {
      operationId: 'login',
      tags: [AUTH_TAG],
      summary: 'Iniciar sesión',
      description: 'Devuelve un token de acceso. Limitado por IP.',
      security: [],
      requestBody: jsonBody(schemaRef('LoginInput')),
      responses: {
        '200': jsonResponse('Sesión iniciada.', dataOf(schemaRef('AuthSession'))),
        ...errors('ValidationError', 'InvalidCredentials', 'RateLimited'),
      },
    },
  },

  '/auth/logout': {
    post: {
      operationId: 'logout',
      tags: [AUTH_TAG],
      summary: 'Cerrar sesión',
      description:
        'Con JWT el estado de sesión vive en el cliente, así que cerrar sesión es descartar el token. El endpoint existe para que web y móvil tengan un punto único al que llamar el día que se añadan cookies o refresh tokens.',
      security: [],
      responses: {
        '204': noContent('Sesión cerrada. El cliente debe descartar el token.'),
        ...errors(),
      },
    },
  },

  '/auth/me': {
    get: {
      operationId: 'getCurrentUser',
      tags: [AUTH_TAG],
      summary: 'Obtener el usuario de la sesión actual',
      responses: {
        '200': jsonResponse('Usuario autenticado.', dataOf(schemaRef('User'))),
        ...errors('Unauthenticated', 'UserNotFound'),
      },
    },
  },
}
