import request from 'supertest'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { app, createAdmin, createProject, createUser, type TestUser } from './helpers/api'
import { disconnectDatabase, resetDatabase } from './helpers/database'

beforeEach(resetDatabase)
afterAll(disconnectDatabase)

const OTHER_UUID = '11111111-1111-4111-8111-111111111111'

describe('autenticación requerida', () => {
  it('todas las rutas de proyectos devuelven 401 sin token', async () => {
    await request(app).get('/api/projects').expect(401)
    await request(app).post('/api/projects').send({ name: 'X' }).expect(401)
    await request(app).get(`/api/projects/${OTHER_UUID}`).expect(401)
    await request(app).patch(`/api/projects/${OTHER_UUID}`).send({ name: 'X' }).expect(401)
    await request(app).delete(`/api/projects/${OTHER_UUID}`).expect(401)
  })
})

describe('POST /api/projects', () => {
  it('crea un proyecto para el usuario autenticado', async () => {
    const user = await createUser()

    const response = await request(app)
      .post('/api/projects')
      .set(user.auth)
      .send({ name: 'Rediseño web', description: 'Landing nueva' })
      .expect(201)

    expect(response.body.data).toMatchObject({
      name: 'Rediseño web',
      description: 'Landing nueva',
      ownerId: user.id,
      taskCount: 0,
    })
  })

  it('ignora un ownerId enviado por el cliente: el dueño lo pone el servidor', async () => {
    const user = await createUser()
    const otherUser = await createUser()

    const response = await request(app)
      .post('/api/projects')
      .set(user.auth)
      .send({ name: 'Intento de suplantación', ownerId: otherUser.id })
      .expect(201)

    expect(response.body.data.ownerId).toBe(user.id)
  })

  it('rechaza un nombre vacío con 422', async () => {
    const user = await createUser()

    const response = await request(app)
      .post('/api/projects')
      .set(user.auth)
      .send({ name: '   ' })
      .expect(422)

    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })
})

describe('GET /api/projects', () => {
  it('devuelve solo los proyectos del usuario autenticado', async () => {
    const ana = await createUser()
    const luis = await createUser()

    await createProject(ana, 'Proyecto de Ana')
    await createProject(luis, 'Proyecto de Luis')

    const response = await request(app).get('/api/projects').set(ana.auth).expect(200)

    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].name).toBe('Proyecto de Ana')
    expect(response.body.meta).toMatchObject({ total: 1, page: 1, limit: 20 })
  })

  it('pagina los resultados', async () => {
    const user = await createUser()
    await createProject(user, 'Uno')
    await createProject(user, 'Dos')
    await createProject(user, 'Tres')

    const response = await request(app)
      .get('/api/projects?page=2&limit=2')
      .set(user.auth)
      .expect(200)

    expect(response.body.data).toHaveLength(1)
    expect(response.body.meta).toMatchObject({ total: 3, page: 2, limit: 2 })
  })

  it('rechaza parámetros de paginación inválidos con 422', async () => {
    const user = await createUser()

    const response = await request(app).get('/api/projects?limit=999').set(user.auth).expect(422)

    expect(response.body.error.details[0].path).toBe('query.limit')
  })
})

describe('ownership de proyectos', () => {
  let ana: TestUser
  let luis: TestUser
  let anaProjectId: string

  beforeEach(async () => {
    ana = await createUser()
    luis = await createUser()
    anaProjectId = (await createProject(ana, 'Proyecto de Ana')).id
  })

  it('el propietario puede leer su proyecto', async () => {
    const response = await request(app)
      .get(`/api/projects/${anaProjectId}`)
      .set(ana.auth)
      .expect(200)

    expect(response.body.data.id).toBe(anaProjectId)
  })

  it('otro usuario NO puede leer el proyecto ajeno', async () => {
    const response = await request(app)
      .get(`/api/projects/${anaProjectId}`)
      .set(luis.auth)
      .expect(403)

    expect(response.body.error.code).toBe('FORBIDDEN')
  })

  it('otro usuario NO puede editar el proyecto ajeno', async () => {
    await request(app)
      .patch(`/api/projects/${anaProjectId}`)
      .set(luis.auth)
      .send({ name: 'Secuestrado' })
      .expect(403)

    const response = await request(app)
      .get(`/api/projects/${anaProjectId}`)
      .set(ana.auth)
      .expect(200)

    expect(response.body.data.name).toBe('Proyecto de Ana')
  })

  it('otro usuario NO puede borrar el proyecto ajeno', async () => {
    await request(app).delete(`/api/projects/${anaProjectId}`).set(luis.auth).expect(403)

    await request(app).get(`/api/projects/${anaProjectId}`).set(ana.auth).expect(200)
  })

  it('un ADMIN sí puede acceder al proyecto de otro usuario', async () => {
    const admin = await createAdmin()

    await request(app).get(`/api/projects/${anaProjectId}`).set(admin.auth).expect(200)
  })
})

describe('PATCH /api/projects/:id', () => {
  it('actualiza el proyecto propio', async () => {
    const user = await createUser()
    const project = await createProject(user, 'Nombre viejo')

    const response = await request(app)
      .patch(`/api/projects/${project.id}`)
      .set(user.auth)
      .send({ name: 'Nombre nuevo' })
      .expect(200)

    expect(response.body.data.name).toBe('Nombre nuevo')
  })

  it('rechaza un cuerpo vacío con 422', async () => {
    const user = await createUser()
    const project = await createProject(user)

    await request(app).patch(`/api/projects/${project.id}`).set(user.auth).send({}).expect(422)
  })
})

describe('DELETE /api/projects/:id', () => {
  it('borra el proyecto propio y responde 204', async () => {
    const user = await createUser()
    const project = await createProject(user)

    await request(app).delete(`/api/projects/${project.id}`).set(user.auth).expect(204)
    await request(app).get(`/api/projects/${project.id}`).set(user.auth).expect(404)
  })
})

describe('errores de recurso', () => {
  it('devuelve 404 si el proyecto no existe', async () => {
    const user = await createUser()

    const response = await request(app)
      .get(`/api/projects/${OTHER_UUID}`)
      .set(user.auth)
      .expect(404)

    expect(response.body.error.code).toBe('PROJECT_NOT_FOUND')
  })

  it('devuelve 422 si el id no es un UUID', async () => {
    const user = await createUser()

    const response = await request(app).get('/api/projects/no-es-uuid').set(user.auth).expect(422)

    expect(response.body.error.details[0].path).toBe('params.id')
  })
})
