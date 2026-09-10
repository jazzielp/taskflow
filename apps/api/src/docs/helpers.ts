import type { JsonSchema, MediaType, OperationObject, ResponseObject } from './types'

/**
 * Constructores para escribir el documento OpenAPI sin repetir estructura.
 *
 * Todo lo que devuelven es JSON plano: no hay magia, solo se evita copiar el
 * mismo `content: { 'application/json': { schema: ... } }` treinta veces.
 */

const JSON_MEDIA_TYPE = 'application/json'

/** Referencia a un componente de `components.schemas`. */
export function schemaRef(id: string): JsonSchema {
  return { $ref: `#/components/schemas/${id}` }
}

/**
 * Envuelve un schema en la convención de respuesta de la API: `{ "data": ... }`.
 * Ver `packages/contracts/src/common/responses.ts`.
 */
export function dataOf(schema: JsonSchema): JsonSchema {
  return {
    type: 'object',
    properties: { data: schema },
    required: ['data'],
  }
}

/** Convención de listado: `{ "data": [...], "meta": { total, page, limit } }`. */
export function listOf(schema: JsonSchema): JsonSchema {
  return {
    type: 'object',
    properties: {
      data: { type: 'array', items: schema },
      meta: schemaRef('ListMeta'),
    },
    required: ['data', 'meta'],
  }
}

export function jsonContent(schema: JsonSchema, example?: unknown): Record<string, MediaType> {
  const media: MediaType = { schema }
  if (example !== undefined) media.example = example

  return { [JSON_MEDIA_TYPE]: media }
}

export function jsonResponse(
  description: string,
  schema: JsonSchema,
  example?: unknown,
): ResponseObject {
  return { description, content: jsonContent(schema, example) }
}

export function jsonBody(schema: JsonSchema): NonNullable<OperationObject['requestBody']> {
  return { required: true, content: jsonContent(schema) }
}

/** 204: la operación fue bien y no hay nada que devolver. */
export function noContent(description: string): ResponseObject {
  return { description }
}
