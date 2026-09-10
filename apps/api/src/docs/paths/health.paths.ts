import { errors } from '../components'
import { jsonResponse } from '../helpers'
import type { PathsObject } from '../types'

export const HEALTH_TAG = 'Estado'

export const healthPaths: PathsObject = {
  '/health': {
    get: {
      operationId: 'getHealth',
      tags: [HEALTH_TAG],
      summary: 'Comprobar que el servicio está vivo',
      description:
        'Único endpoint que no sigue la convención `{ "data": ... }`: lo consumen balanceadores y orquestadores, que esperan una respuesta plana y estable. No requiere autenticación.',
      security: [],
      responses: {
        '200': jsonResponse(
          'El servicio responde.',
          {
            type: 'object',
            properties: { status: { type: 'string', enum: ['ok'] } },
            required: ['status'],
          },
          { status: 'ok' },
        ),
        ...errors(),
      },
    },
  },
}
