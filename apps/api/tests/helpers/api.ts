import { Role, prisma } from '@taskflow/database'
import request from 'supertest'

import { createApp } from '../../src/app'
import { hashPassword } from '../../src/lib/password'

export const app = createApp()

export const DEFAULT_PASSWORD = 'Password123!'

export type TestUser = {
  id: string
  name: string
  email: string
  token: string
  /** Cabecera lista para usar: `.set(...user.auth)`. */
  auth: { Authorization: string }
}

let counter = 0

/** Da de alta un usuario a través de la API y devuelve su token. */
export async function createUser(overrides: Partial<{ name: string; email: string }> = {}) {
  counter += 1
  const email = overrides.email ?? `user${counter}.${Date.now()}@taskflow.test`
  const name = overrides.name ?? `Usuario ${counter}`

  const response = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password: DEFAULT_PASSWORD })
    .expect(201)

  const { user, accessToken } = response.body.data

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    token: accessToken,
    auth: { Authorization: `Bearer ${accessToken}` },
  } satisfies TestUser
}

/**
 * Crea un ADMIN. No se puede hacer por la API (el registro siempre crea USER),
 * así que se inserta directamente y luego se inicia sesión con normalidad.
 */
export async function createAdmin(): Promise<TestUser> {
  counter += 1
  const email = `admin${counter}.${Date.now()}@taskflow.test`

  const user = await prisma.user.create({
    data: {
      name: 'Admin de prueba',
      email,
      passwordHash: await hashPassword(DEFAULT_PASSWORD),
      role: Role.ADMIN,
    },
  })

  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password: DEFAULT_PASSWORD })
    .expect(200)

  const accessToken: string = response.body.data.accessToken

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    token: accessToken,
    auth: { Authorization: `Bearer ${accessToken}` },
  }
}

/** Crea un proyecto para el usuario indicado y devuelve el DTO. */
export async function createProject(user: TestUser, name = 'Proyecto de prueba') {
  const response = await request(app)
    .post('/api/projects')
    .set(user.auth)
    .send({ name })
    .expect(201)

  return response.body.data
}

/** Crea una tarea dentro de un proyecto y devuelve el DTO. */
export async function createTask(
  user: TestUser,
  projectId: string,
  body: Record<string, unknown> = { title: 'Tarea de prueba' },
) {
  const response = await request(app)
    .post(`/api/projects/${projectId}/tasks`)
    .set(user.auth)
    .send(body)
    .expect(201)

  return response.body.data
}
