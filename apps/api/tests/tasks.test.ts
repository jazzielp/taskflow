import { prisma } from '@taskflow/database'
import request from 'supertest'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { app, createProject, createTask, createUser, type TestUser } from './helpers/api'
import { disconnectDatabase, resetDatabase } from './helpers/database'

beforeEach(resetDatabase)
afterAll(disconnectDatabase)

const OTHER_UUID = '11111111-1111-4111-8111-111111111111'

let ana: TestUser
let luis: TestUser
let projectId: string

beforeEach(async () => {
  ana = await createUser()
  luis = await createUser()
  projectId = (await createProject(ana, 'Proyecto de Ana')).id
})

describe('POST /api/projects/:projectId/tasks', () => {
  it('crea una tarea en el proyecto propio, en estado TODO por defecto', async () => {
    const response = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set(ana.auth)
      .send({ title: 'Maquetar la home' })
      .expect(201)

    expect(response.body.data).toMatchObject({
      title: 'Maquetar la home',
      status: 'TODO',
      projectId,
    })
  })

  it('NO permite crear una tarea en un proyecto ajeno', async () => {
    const response = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set(luis.auth)
      .send({ title: 'Tarea intrusa' })
      .expect(403)

    expect(response.body.error.code).toBe('FORBIDDEN')
    expect(await prisma.task.count()).toBe(0)
  })

  it('devuelve 404 si el proyecto no existe', async () => {
    const response = await request(app)
      .post(`/api/projects/${OTHER_UUID}/tasks`)
      .set(ana.auth)
      .send({ title: 'Tarea huérfana' })
      .expect(404)

    expect(response.body.error.code).toBe('PROJECT_NOT_FOUND')
  })

  it('rechaza un estado que no existe', async () => {
    const response = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set(ana.auth)
      .send({ title: 'Tarea', status: 'ARCHIVADA' })
      .expect(422)

    expect(response.body.error.details[0].path).toBe('body.status')
  })

  it('exige título', async () => {
    await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set(ana.auth)
      .send({ description: 'sin título' })
      .expect(422)
  })
})

describe('GET /api/projects/:projectId/tasks', () => {
  it('lista las tareas del proyecto', async () => {
    await createTask(ana, projectId, { title: 'Uno' })
    await createTask(ana, projectId, { title: 'Dos' })

    const response = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set(ana.auth)
      .expect(200)

    expect(response.body.data).toHaveLength(2)
    expect(response.body.meta.total).toBe(2)
  })

  it('filtra por estado', async () => {
    await createTask(ana, projectId, { title: 'Pendiente' })
    await createTask(ana, projectId, { title: 'Hecha', status: 'DONE' })

    const response = await request(app)
      .get(`/api/projects/${projectId}/tasks?status=DONE`)
      .set(ana.auth)
      .expect(200)

    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].title).toBe('Hecha')
  })

  it('NO deja listar las tareas de un proyecto ajeno', async () => {
    await createTask(ana, projectId, { title: 'Privada' })

    await request(app).get(`/api/projects/${projectId}/tasks`).set(luis.auth).expect(403)
  })
})

describe('ownership de tareas (heredado del proyecto)', () => {
  let taskId: string

  beforeEach(async () => {
    taskId = (await createTask(ana, projectId, { title: 'Tarea de Ana' })).id
  })

  it('el propietario del proyecto puede leer la tarea', async () => {
    const response = await request(app).get(`/api/tasks/${taskId}`).set(ana.auth).expect(200)

    expect(response.body.data.id).toBe(taskId)
  })

  it('otro usuario NO puede leerla', async () => {
    const response = await request(app).get(`/api/tasks/${taskId}`).set(luis.auth).expect(403)

    expect(response.body.error.code).toBe('FORBIDDEN')
  })

  it('otro usuario NO puede editarla', async () => {
    await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set(luis.auth)
      .send({ title: 'Secuestrada' })
      .expect(403)

    const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } })
    expect(task.title).toBe('Tarea de Ana')
  })

  it('otro usuario NO puede borrarla', async () => {
    await request(app).delete(`/api/tasks/${taskId}`).set(luis.auth).expect(403)

    expect(await prisma.task.count({ where: { id: taskId } })).toBe(1)
  })

  it('otro usuario NO puede cambiarle el estado', async () => {
    await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set(luis.auth)
      .send({ status: 'DONE' })
      .expect(403)
  })
})

describe('PATCH /api/tasks/:id', () => {
  it('actualiza título y descripción', async () => {
    const task = await createTask(ana, projectId, { title: 'Antes' })

    const response = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set(ana.auth)
      .send({ title: 'Después', description: 'Con contexto' })
      .expect(200)

    expect(response.body.data).toMatchObject({ title: 'Después', description: 'Con contexto' })
  })

  it('devuelve 404 si la tarea no existe', async () => {
    const response = await request(app)
      .patch(`/api/tasks/${OTHER_UUID}`)
      .set(ana.auth)
      .send({ title: 'X' })
      .expect(404)

    expect(response.body.error.code).toBe('TASK_NOT_FOUND')
  })
})

describe('PATCH /api/tasks/:id/status', () => {
  it('permite TODO -> IN_PROGRESS -> DONE', async () => {
    const task = await createTask(ana, projectId, { title: 'Flujo normal' })

    const started = await request(app)
      .patch(`/api/tasks/${task.id}/status`)
      .set(ana.auth)
      .send({ status: 'IN_PROGRESS' })
      .expect(200)
    expect(started.body.data.status).toBe('IN_PROGRESS')

    const done = await request(app)
      .patch(`/api/tasks/${task.id}/status`)
      .set(ana.auth)
      .send({ status: 'DONE' })
      .expect(200)
    expect(done.body.data.status).toBe('DONE')
  })

  it('permite reabrir una tarea terminada como IN_PROGRESS', async () => {
    const task = await createTask(ana, projectId, { title: 'Reabrir', status: 'DONE' })

    await request(app)
      .patch(`/api/tasks/${task.id}/status`)
      .set(ana.auth)
      .send({ status: 'IN_PROGRESS' })
      .expect(200)
  })

  it('rechaza DONE -> TODO con 422', async () => {
    const task = await createTask(ana, projectId, { title: 'Terminada', status: 'DONE' })

    const response = await request(app)
      .patch(`/api/tasks/${task.id}/status`)
      .set(ana.auth)
      .send({ status: 'TODO' })
      .expect(422)

    expect(response.body.error.code).toBe('INVALID_STATUS_TRANSITION')
  })

  it('rechaza cambiar una tarea a su estado actual', async () => {
    const task = await createTask(ana, projectId, { title: 'Sin cambios' })

    await request(app)
      .patch(`/api/tasks/${task.id}/status`)
      .set(ana.auth)
      .send({ status: 'TODO' })
      .expect(422)
  })
})

describe('DELETE /api/tasks/:id', () => {
  it('borra la tarea propia', async () => {
    const task = await createTask(ana, projectId, { title: 'A borrar' })

    await request(app).delete(`/api/tasks/${task.id}`).set(ana.auth).expect(204)
    await request(app).get(`/api/tasks/${task.id}`).set(ana.auth).expect(404)
  })
})

describe('borrado en cascada', () => {
  it('al borrar un proyecto desaparecen sus tareas', async () => {
    await createTask(ana, projectId, { title: 'Uno' })
    await createTask(ana, projectId, { title: 'Dos' })

    await request(app).delete(`/api/projects/${projectId}`).set(ana.auth).expect(204)

    expect(await prisma.task.count({ where: { projectId } })).toBe(0)
  })
})
