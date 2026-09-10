import { documentedSchemas } from '@taskflow/contracts'
import request from 'supertest'
import { afterAll, describe, expect, it } from 'vitest'

import { buildOpenApiDocument } from '../src/docs/openapi'
import { app } from './helpers/api'
import { disconnectDatabase } from './helpers/database'

afterAll(disconnectDatabase)

const document = buildOpenApiDocument()

const HTTP_METHODS = ['get', 'post', 'patch', 'put', 'delete'] as const

/** Todas las operaciones del documento, aplanadas: `['get', '/projects/{id}']`. */
const operations = Object.entries(document.paths).flatMap(([path, item]) =>
  HTTP_METHODS.filter((method) => item[method]).map((method) => [method, path] as const),
)

describe('GET /api/openapi.json', () => {
  it('sirve el contrato en OpenAPI 3.0', async () => {
    const response = await request(app).get('/api/openapi.json').expect(200)

    expect(response.body.openapi).toMatch(/^3\.0\./)
    expect(response.body.info.title).toBe('TaskFlow API')
    expect(response.body.paths).toBeTruthy()
  })
})

describe('documento OpenAPI', () => {
  it('publica como componente todos los contratos marcados para documentar', () => {
    expect(Object.keys(document.components.schemas)).toHaveLength(documentedSchemas.length)
  })

  it('no deja ninguna referencia rota', () => {
    // Una `$ref` que no resuelve no rompe el servidor: rompe la UI y cualquier
    // generador de clientes, y solo se nota al abrir la página. Mejor aquí.
    for (const ref of collectRefs(document)) {
      expect(resolveRef(document, ref), `referencia rota: ${ref}`).toBeTruthy()
    }
  })

  it('protege por defecto y solo abre lo que declara público', () => {
    expect(document.security).toEqual([{ bearerAuth: [] }])

    const publicOperations = operations
      .filter(([method, path]) => document.paths[path]?.[method]?.security?.length === 0)
      .map(([, path]) => path)

    expect(publicOperations.sort()).toEqual([
      '/auth/login',
      '/auth/logout',
      '/auth/register',
      '/health',
    ])
  })

  it.each(operations)('documenta una ruta que existe de verdad: %s %s', async (method, path) => {
    // Sin token: lo que se comprueba es que Express encuentra la ruta, no que
    // la operación funcione. Una ruta inexistente responde `NOT_FOUND`.
    const url = `/api${path.replace(/\{[^}]+\}/g, '00000000-0000-4000-8000-000000000000')}`
    const response = await request(app)[method](url)

    expect(response.body?.error?.code).not.toBe('NOT_FOUND')
  })

  it('documenta todas las rutas que expone la API', () => {
    // Las dos rutas de la propia documentación (`/openapi.json` y `/docs`) no
    // se describen a sí mismas: no forman parte del contrato del producto.
    const DOCS_ROUTES = 2

    expect(countRegisteredRoutes()).toBe(operations.length + DOCS_ROUTES)
  })
})

describe('GET /api/docs', () => {
  it('sirve la referencia de Scalar', async () => {
    const response = await request(app).get('/api/docs').expect(200)

    expect(response.headers['content-type']).toMatch(/text\/html/)
    expect(response.text).toContain('/api/openapi.json')
  })

  it('la sirve con una CSP que autoriza el CDN mediante un nonce irrepetible', async () => {
    const [first, second] = await Promise.all([
      request(app).get('/api/docs').expect(200),
      request(app).get('/api/docs').expect(200),
    ])

    const policy = first.headers['content-security-policy'] ?? ''

    expect(policy).toContain('https://cdn.jsdelivr.net')
    expect(policy).not.toContain("script-src 'self' 'unsafe-inline'")

    const nonceOf = (response: { headers: Record<string, string | undefined> }): string =>
      /'nonce-([^']+)'/.exec(response.headers['content-security-policy'] ?? '')?.[1] ?? ''

    expect(nonceOf(first)).toBeTruthy()
    expect(nonceOf(first)).not.toBe(nonceOf(second))
  })
})

/** Recoge todas las `$ref` del documento, a cualquier profundidad. */
function collectRefs(value: unknown, found: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const item of value) collectRefs(item, found)
    return found
  }

  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (key === '$ref' && typeof child === 'string') found.push(child)
      else collectRefs(child, found)
    }
  }

  return found
}

/** Resuelve una referencia local (`#/components/schemas/Task`). */
function resolveRef(document: unknown, ref: string): unknown {
  return ref
    .replace(/^#\//, '')
    .split('/')
    .reduce<unknown>(
      (node, segment) =>
        node && typeof node === 'object' ? (node as Record<string, unknown>)[segment] : undefined,
      document,
    )
}

/**
 * Cuenta los endpoints registrados en Express.
 *
 * Express 5 no expone el prefijo bajo el que se monta cada router, así que no
 * se puede reconstruir la URL completa; sí se pueden contar las hojas. Si
 * alguien añade un endpoint y no lo documenta, este test falla.
 */
function countRegisteredRoutes(): number {
  type Layer = {
    route?: { methods: Record<string, boolean> }
    name: string
    handle?: { stack?: Layer[] }
  }

  const count = (stack: Layer[]): number =>
    stack.reduce((total, layer) => {
      if (layer.route) return total + Object.keys(layer.route.methods).length
      if (layer.name === 'router' && layer.handle?.stack) return total + count(layer.handle.stack)
      return total
    }, 0)

  return count((app as unknown as { router: { stack: Layer[] } }).router.stack)
}
