import { documentedSchemas } from '@taskflow/contracts'
import { z } from 'zod'

import type { JsonSchema } from './types'

/**
 * Traduce a JSON Schema todos los schemas de `@taskflow/contracts` marcados con
 * `.meta({ id })`, para publicarlos en `components.schemas`.
 *
 * Zod 4 sabe generar JSON Schema por sí mismo (`z.toJSONSchema`), así que no
 * hace falta ninguna librería intermedia: la documentación sale de los MISMOS
 * schemas con los que la API valida. Si un contrato cambia y la documentación
 * no, es porque alguien ha escrito dos veces la misma verdad; aquí solo existe
 * una.
 */
export function buildSchemas(): Record<string, JsonSchema> {
  // Referenciar el inventario garantiza que todos los módulos de contratos se
  // han evaluado (y por tanto registrado en el registro global de Zod) antes de
  // leerlo. Ver el comentario de `documentedSchemas`.
  const expected = documentedSchemas.length

  const { schemas } = z.toJSONSchema(z.globalRegistry, {
    // OpenAPI 3.0 no es JSON Schema draft 2020-12: usa `nullable: true` en vez
    // de `type: [..., 'null']`, entre otras diferencias.
    target: 'openapi-3.0',
    // Se documenta el lado de ENTRADA: es lo que envía el cliente y, en los
    // DTOs de respuesta (schemas sin transformaciones), coincide con la salida.
    io: 'input',
    uri: (id) => `#/components/schemas/${id}`,
    override: simplify,
  }) as { schemas: Record<string, JsonSchema> }

  // `$id` lo escribe el propio registro DESPUÉS del hook `override`, así que
  // hay que quitarlo aquí: solo tiene sentido dentro de Zod y en el documento
  // duplica la clave bajo la que ya está el schema.
  for (const schema of Object.values(schemas)) delete schema['$id']

  if (Object.keys(schemas).length < expected) {
    // Defensa contra un bundler que elimine un módulo por parecer no usado:
    // mejor fallar al construir el documento que servir una documentación
    // incompleta sin que nadie se dé cuenta.
    throw new Error(
      `Faltan schemas en la documentación: se esperaban ${expected} y se han generado ${Object.keys(schemas).length}.`,
    )
  }

  return schemas
}

/**
 * Limpia ruido que Zod añade y que no aporta nada al lector:
 *
 *  - `pattern` cuando ya hay `format`: el patrón de un UUID o de una fecha ISO
 *    ocupa varias líneas en la UI y dice lo mismo que `format: uuid`.
 *  - los límites de `Number.MAX_SAFE_INTEGER` que Zod anota en todo entero.
 */
function simplify(ctx: { jsonSchema: JsonSchema }): void {
  const schema = ctx.jsonSchema

  if (typeof schema['format'] === 'string' && schema['pattern']) delete schema['pattern']

  if (schema['type'] === 'integer') {
    if (schema['minimum'] === Number.MIN_SAFE_INTEGER) delete schema['minimum']
    if (schema['maximum'] === Number.MAX_SAFE_INTEGER) delete schema['maximum']
  }
}
