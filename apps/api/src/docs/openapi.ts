import { API_PREFIX, AUTH_RATE_LIMIT, REQUEST_ID_HEADER } from '@taskflow/config'

import { errorResponses, parameters, securitySchemes } from './components'
import { authPaths, AUTH_TAG } from './paths/auth.paths'
import { healthPaths, HEALTH_TAG } from './paths/health.paths'
import { projectPaths, PROJECT_TAG } from './paths/project.paths'
import { taskPaths, TASK_TAG } from './paths/task.paths'
import { buildSchemas } from './schemas'
import type { OpenApiDocument } from './types'

/** Versión del contrato, no del despliegue. Sube cuando la API cambia de forma. */
export const API_VERSION = '1.0.0'

const DESCRIPTION = `
API de TaskFlow: usuarios, proyectos y tareas.

## Autenticación

Todos los endpoints exigen sesión salvo \`/health\` y los de \`/auth\` marcados como públicos.

1. \`POST /auth/register\` o \`POST /auth/login\` devuelven un \`accessToken\`.
2. Envíalo en cada petición: \`Authorization: Bearer <token>\`.

Los endpoints de registro e inicio de sesión están limitados a ${AUTH_RATE_LIMIT.max} intentos por IP cada ${AUTH_RATE_LIMIT.windowMs / 60_000} minutos.

## Forma de las respuestas

| Caso | Cuerpo |
| --- | --- |
| Un recurso | \`{ "data": { ... } }\` |
| Un listado | \`{ "data": [ ... ], "meta": { "total": 0, "page": 1, "limit": 20 } }\` |
| Un error | \`{ "error": { "code": "...", "message": "..." } }\` |

\`/health\` es la única excepción: responde plano porque lo consumen balanceadores, no la aplicación.

## Errores

Ramifica siempre sobre \`error.code\`, nunca sobre \`error.message\`: el código es estable, el mensaje puede cambiar.
En los errores de validación, \`error.details\` indica qué campo ha fallado (\`body.email\`, \`query.page\`...).

Toda respuesta lleva la cabecera \`${REQUEST_ID_HEADER}\`, que también aparece en \`error.requestId\`. Inclúyelo al reportar una incidencia.

## Propiedad de los recursos

Un usuario solo ve y modifica sus propios proyectos, y las tareas heredan el propietario de su proyecto.
Pedir un recurso ajeno devuelve \`403 FORBIDDEN\` si existe, o el \`404\` correspondiente si no.
`.trim()

/**
 * Construye el documento OpenAPI completo.
 *
 * Se genera al vuelo en lugar de guardarse en el repositorio: los schemas
 * salen de `@taskflow/contracts` y la tabla de transiciones de
 * `@taskflow/domain`, así que el documento no puede quedarse desfasado
 * respecto al código. Para publicarlo en CI existe `pnpm docs:export`.
 *
 * La seguridad se declara a nivel de documento (`security`) y los endpoints
 * públicos la anulan con `security: []`. Es más difícil olvidarse de proteger
 * un endpoint nuevo que de abrirlo.
 */
export function buildOpenApiDocument(): OpenApiDocument {
  return {
    openapi: '3.0.3',
    info: {
      title: 'TaskFlow API',
      version: API_VERSION,
      description: DESCRIPTION,
      license: { name: 'MIT' },
    },
    // URL relativa: la documentación funciona igual en local, en staging y en
    // producción sin tener que saber en qué host se está sirviendo.
    servers: [{ url: API_PREFIX, description: 'El servidor que sirve esta documentación' }],
    tags: [
      { name: AUTH_TAG, description: 'Registro, inicio de sesión y usuario actual.' },
      { name: PROJECT_TAG, description: 'Proyectos del usuario autenticado.' },
      { name: TASK_TAG, description: 'Tareas, siempre dentro de un proyecto.' },
      { name: HEALTH_TAG, description: 'Comprobación de vida del servicio.' },
    ],
    security: [{ bearerAuth: [] }],
    paths: {
      ...authPaths,
      ...projectPaths,
      ...taskPaths,
      ...healthPaths,
    },
    components: {
      schemas: buildSchemas(),
      securitySchemes,
      parameters,
      responses: errorResponses,
    },
  }
}

/**
 * El documento no cambia durante la vida del proceso, así que se construye una
 * sola vez y se reutiliza: `/openapi.json` puede recibir muchas peticiones (la
 * UI lo pide en cada recarga) y regenerarlo cada vez sería trabajo tirado.
 */
let cached: OpenApiDocument | undefined

export function getOpenApiDocument(): OpenApiDocument {
  cached ??= buildOpenApiDocument()
  return cached
}
