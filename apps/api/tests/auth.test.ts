import { prisma } from '@taskflow/database'
import request from 'supertest'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { DEFAULT_PASSWORD, app, createUser } from './helpers/api'
import { disconnectDatabase, resetDatabase } from './helpers/database'

beforeEach(resetDatabase)
afterAll(disconnectDatabase)

describe('POST /api/auth/register', () => {
  it('crea el usuario y devuelve una sesión', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ana', email: 'ana@taskflow.test', password: DEFAULT_PASSWORD })
      .expect(201)

    expect(response.body.data.user).toMatchObject({
      name: 'Ana',
      email: 'ana@taskflow.test',
      role: 'USER',
    })
    expect(response.body.data.accessToken).toEqual(expect.any(String))
  })

  it('nunca devuelve el hash de la contraseña', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ana', email: 'ana@taskflow.test', password: DEFAULT_PASSWORD })
      .expect(201)

    expect(JSON.stringify(response.body)).not.toContain('passwordHash')
    expect(JSON.stringify(response.body)).not.toContain(DEFAULT_PASSWORD)
  })

  it('guarda la contraseña hasheada, nunca en texto plano', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ana', email: 'ana@taskflow.test', password: DEFAULT_PASSWORD })
      .expect(201)

    const user = await prisma.user.findUniqueOrThrow({ where: { email: 'ana@taskflow.test' } })

    expect(user.passwordHash).not.toBe(DEFAULT_PASSWORD)
    expect(user.passwordHash.startsWith('$argon2')).toBe(true)
  })

  it('normaliza el email (espacios y mayúsculas)', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ana', email: '  ANA@TaskFlow.test ', password: DEFAULT_PASSWORD })
      .expect(201)

    expect(response.body.data.user.email).toBe('ana@taskflow.test')
  })

  it('rechaza un email ya registrado con 409', async () => {
    const payload = { name: 'Ana', email: 'ana@taskflow.test', password: DEFAULT_PASSWORD }
    await request(app).post('/api/auth/register').send(payload).expect(201)

    const response = await request(app).post('/api/auth/register').send(payload).expect(409)

    expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS')
  })

  it('rechaza datos inválidos con 422 y detalla los campos', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: '', email: 'no-es-un-email', password: '123' })
      .expect(422)

    expect(response.body.error.code).toBe('VALIDATION_ERROR')

    const paths = response.body.error.details.map((detail: { path: string }) => detail.path)
    expect(paths).toContain('body.name')
    expect(paths).toContain('body.email')
    expect(paths).toContain('body.password')
  })

  it('ignora un rol enviado por el cliente: siempre se crea como USER', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Ana',
        email: 'ana@taskflow.test',
        password: DEFAULT_PASSWORD,
        role: 'ADMIN',
      })
      .expect(201)

    expect(response.body.data.user.role).toBe('USER')
  })
})

describe('POST /api/auth/login', () => {
  it('devuelve una sesión con credenciales correctas', async () => {
    const user = await createUser()

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: DEFAULT_PASSWORD })
      .expect(200)

    expect(response.body.data.user.id).toBe(user.id)
    expect(response.body.data.accessToken).toEqual(expect.any(String))
  })

  it('devuelve 401 si la contraseña no es correcta', async () => {
    const user = await createUser()

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'contrasena-incorrecta' })
      .expect(401)

    expect(response.body.error.code).toBe('INVALID_CREDENTIALS')
  })

  it('devuelve el mismo error si el email no existe (no filtra qué emails hay)', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'no-existe@taskflow.test', password: DEFAULT_PASSWORD })
      .expect(401)

    expect(response.body.error.code).toBe('INVALID_CREDENTIALS')
  })
})

describe('GET /api/auth/me', () => {
  it('devuelve el perfil del usuario autenticado', async () => {
    const user = await createUser({ name: 'Ana' })

    const response = await request(app).get('/api/auth/me').set(user.auth).expect(200)

    expect(response.body.data).toMatchObject({ id: user.id, name: 'Ana', role: 'USER' })
  })

  it('devuelve 401 sin token', async () => {
    const response = await request(app).get('/api/auth/me').expect(401)

    expect(response.body.error.code).toBe('UNAUTHENTICATED')
  })

  it('devuelve 401 con un token manipulado', async () => {
    const user = await createUser()

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${user.token.slice(0, -3)}xyz`)
      .expect(401)

    expect(response.body.error.code).toBe('UNAUTHENTICATED')
  })

  it('devuelve 401 si el esquema de la cabecera no es Bearer', async () => {
    await request(app).get('/api/auth/me').set('Authorization', 'Basic abc123').expect(401)
  })
})

describe('POST /api/auth/logout', () => {
  it('responde 204', async () => {
    await request(app).post('/api/auth/logout').expect(204)
  })
})
