import { randomBytes } from 'node:crypto'

import { apiReference } from '@scalar/express-api-reference'
import { API_PREFIX } from '@taskflow/config'
import { Router, type RequestHandler } from 'express'
import helmet from 'helmet'

import { getOpenApiDocument } from './openapi'

/**
 * Documentación de la API.
 *
 *   GET /api/openapi.json   el contrato en OpenAPI 3.0 (para clientes y codegen)
 *   GET /api/docs           la referencia interactiva de Scalar
 *
 * Se monta solo si `env.docsEnabled` lo permite. Ver `routes/index.ts`.
 */
export const OPENAPI_PATH = '/openapi.json'
export const DOCS_PATH = '/docs'

const router: Router = Router()

router.get(OPENAPI_PATH, (_req, res) => {
  res.json(getOpenApiDocument())
})

/**
 * Scalar se carga desde un CDN y necesita ejecutar un script en línea para
 * arrancar, así que la CSP estricta que aplica `helmet()` a toda la API
 * bloquearía la página. En lugar de desactivar la CSP para esta ruta, se
 * sustituye por otra igual de estricta pero adaptada:
 *
 *  - el script en línea se autoriza con un `nonce` distinto en cada petición,
 *    no con `'unsafe-inline'` (que abriría la puerta a CUALQUIER script);
 *  - solo se permite el host del CDN, nada más.
 *
 * `style-src` sí necesita `'unsafe-inline'`: la referencia pinta atributos
 * `style="..."` que un nonce no puede autorizar.
 */
const SCALAR_CDN = 'https://cdn.jsdelivr.net'
const SCALAR_FONTS = 'https://fonts.scalar.com'

function docsSecurity(nonce: string): RequestHandler {
  return helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", `'nonce-${nonce}'`, SCALAR_CDN],
        styleSrc: ["'self'", "'unsafe-inline'", SCALAR_CDN, SCALAR_FONTS],
        fontSrc: ["'self'", 'data:', SCALAR_CDN, SCALAR_FONTS],
        imgSrc: ["'self'", 'data:', SCALAR_CDN],
        // Las peticiones de prueba de la UI van contra esta misma API.
        connectSrc: ["'self'"],
      },
    },
    // La referencia carga recursos del CDN sin CORP; con la política por
    // defecto de helmet el navegador los rechazaría.
    crossOriginEmbedderPolicy: false,
  })
}

router.get(DOCS_PATH, (req, res, next) => {
  // Un nonce debe ser irrepetible: reutilizar uno entre peticiones equivale a
  // no tenerlo.
  const nonce = randomBytes(16).toString('base64')

  docsSecurity(nonce)(req, res, (error?: unknown) => {
    if (error) {
      next(error)
      return
    }

    const render = apiReference({
      url: `${API_PREFIX}${OPENAPI_PATH}`,
      pageTitle: 'TaskFlow API',
      nonce,
    }) as RequestHandler

    render(req, res, next)
  })
})

export { router as docsRoutes }
