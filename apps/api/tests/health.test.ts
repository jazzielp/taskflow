import request from 'supertest'
import { afterAll, describe, expect, it } from 'vitest'

import { app } from './helpers/api'
import { disconnectDatabase } from './helpers/database'

afterAll(disconnectDatabase)

describe('GET /api/health', () => {
  it('responde 200 con el estado del servicio', async () => {
    const response = await request(app).get('/api/health').expect(200)

    expect(response.body).toEqual({ status: 'ok' })
  })

  it('incluye un identificador de request en la cabecera', async () => {
    const response = await request(app).get('/api/health').expect(200)

    expect(response.headers['x-request-id']).toBeTruthy()
  })
})

describe('rutas inexistentes', () => {
  it('responden 404 con el formato de error de la API', async () => {
    const response = await request(app).get('/api/no-existe').expect(404)

    expect(response.body.error.code).toBe('NOT_FOUND')
    expect(response.body.error.requestId).toBeTruthy()
  })
})
