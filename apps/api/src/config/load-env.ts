import { existsSync } from 'node:fs'
import path from 'node:path'

/**
 * Carga los archivos `.env` en `process.env`.
 *
 * Este módulo solo tiene efecto secundario y ninguna dependencia, y está
 * pensado para importarse EL PRIMERO DE TODO en el punto de entrada.
 *
 * El motivo: los módulos ES se evalúan en el orden en que aparecen sus
 * `import`. `@taskflow/database` lee `DATABASE_URL` al crear el cliente de
 * Prisma, así que si se importa antes de que las variables estén cargadas, la
 * aplicación revienta al arrancar. Cargar el entorno en un módulo aparte, y
 * ponerlo el primero, hace que ese orden sea explícito en lugar de accidental.
 *
 * Se buscan los `.env` desde el directorio actual hacia arriba, del más
 * cercano al más lejano. `process.loadEnvFile` no pisa variables que ya
 * existen, así que gana el más cercano:
 *
 *     apps/api/.env   (específico de la API, opcional)
 *     .env            (raíz del monorepo)
 *     el entorno real (variables ya exportadas: siempre tienen prioridad)
 *
 * En producción normalmente no habrá ningún `.env` y las variables vendrán del
 * propio entorno. Eso es correcto y no requiere ningún cambio.
 */
function loadEnvFiles(): void {
  let directory = process.cwd()

  for (;;) {
    const candidate = path.join(directory, '.env')
    if (existsSync(candidate)) process.loadEnvFile(candidate)

    const parent = path.dirname(directory)
    if (parent === directory) break
    directory = parent
  }
}

loadEnvFiles()
