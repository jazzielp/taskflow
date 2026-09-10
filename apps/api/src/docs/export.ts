import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { buildOpenApiDocument } from './openapi'

/**
 * Vuelca el contrato a un fichero:
 *
 *   pnpm --filter @taskflow/api docs:export [ruta]
 *
 * Sirve para publicarlo como artefacto de CI, generar clientes o revisar en un
 * pull request qué ha cambiado en la API. El fichero NO se versiona: se genera
 * desde el código, que es la fuente de verdad.
 */
const target = resolve(process.argv[2] ?? 'openapi.json')

writeFileSync(target, `${JSON.stringify(buildOpenApiDocument(), null, 2)}\n`, 'utf8')

process.stdout.write(`OpenAPI escrito en ${target}\n`)
