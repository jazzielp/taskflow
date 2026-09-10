/**
 * Tipos mínimos de OpenAPI 3.0.
 *
 * Se declaran aquí en lugar de añadir una dependencia (`openapi-types`) porque
 * solo se usa un puñado de campos y así el documento sigue siendo un objeto
 * plano y serializable. Son deliberadamente laxos: el objetivo es evitar
 * erratas en la estructura, no reimplementar la especificación.
 */

/** Un fragmento de JSON Schema, tal y como lo genera Zod o lo escribimos a mano. */
export type JsonSchema = Record<string, unknown>

export type MediaType = {
  schema: JsonSchema
  example?: unknown
}

export type ResponseObject = {
  description: string
  content?: Record<string, MediaType>
}

/** Una referencia a `#/components/...`. */
export type Ref = { $ref: string }

export type ParameterObject = {
  name: string
  in: 'path' | 'query' | 'header'
  required?: boolean
  description?: string
  schema: JsonSchema
}

export type OperationObject = {
  operationId: string
  tags: string[]
  summary: string
  description?: string
  security?: Array<Record<string, string[]>>
  parameters?: Array<ParameterObject | Ref>
  requestBody?: {
    required: boolean
    content: Record<string, MediaType>
  }
  responses: Record<string, ResponseObject | Ref>
}

export type PathItemObject = Partial<
  Record<'get' | 'post' | 'patch' | 'put' | 'delete', OperationObject>
>

export type PathsObject = Record<string, PathItemObject>

export type OpenApiDocument = {
  openapi: string
  info: Record<string, unknown>
  servers: Array<{ url: string; description?: string }>
  tags: Array<{ name: string; description?: string }>
  /** Seguridad por defecto. Los endpoints públicos la anulan con `security: []`. */
  security: Array<Record<string, string[]>>
  paths: PathsObject
  components: {
    schemas: Record<string, JsonSchema>
    securitySchemes: Record<string, JsonSchema>
    parameters: Record<string, ParameterObject>
    responses: Record<string, ResponseObject>
  }
}
