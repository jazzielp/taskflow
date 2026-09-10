import { AUTH_SCHEME, REQUEST_ID_HEADER } from '@taskflow/config'
import { apiErrorSchema, listMetaSchema, type ListMeta } from '@taskflow/contracts'
import { z } from 'zod'

import { ApiClientError, CLIENT_ERROR_CODES } from './errors'

export type QueryParams = Record<string, string | number | boolean | undefined>

export type ApiClientOptions = {
  /** Base de la API, incluyendo el prefijo. Ej: `http://localhost:3000/api`. */
  baseUrl: string
  /** Devuelve el token de la sesión actual, o null si no hay sesión. */
  getToken?: () => string | null
  /**
   * Se llama cuando la API responde 401. Es el punto donde la app limpia la
   * sesión y manda al usuario a `/login`, sin que cada pantalla lo repita.
   */
  onUnauthenticated?: () => void
  /** Inyectable para poder testear sin red. */
  fetch?: typeof globalThis.fetch
}

type RequestInput<TData> = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  /** Schema del contenido de `data`. Se omite en las respuestas 204. */
  schema?: z.ZodType<TData>
  body?: unknown
  query?: QueryParams
  /** Por defecto true: casi toda la API exige sesión. */
  auth?: boolean
}

function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
  const url = new URL(baseUrl.replace(/\/$/, '') + path)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }
  return url.toString()
}

/**
 * Traduce una respuesta de error de la API a `ApiClientError`.
 *
 * El cuerpo se valida con el mismo schema que usa la API para escribirlo. Si no
 * encaja (un proxy que devuelve HTML, un 502 de infraestructura), el error se
 * reporta igual pero como `INVALID_RESPONSE`: la UI nunca recibe un `undefined`
 * disfrazado de dato.
 */
async function toApiError(response: Response): Promise<ApiClientError> {
  const requestId = response.headers.get(REQUEST_ID_HEADER) ?? undefined

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  const parsed = apiErrorSchema.safeParse(payload)
  if (!parsed.success) {
    return new ApiClientError({
      code: CLIENT_ERROR_CODES.INVALID_RESPONSE,
      message: `La API respondió ${response.status} con un cuerpo que no sigue el contrato.`,
      status: response.status,
      requestId,
    })
  }

  const { code, message, details, requestId: bodyRequestId } = parsed.data.error
  return new ApiClientError({
    code,
    message,
    status: response.status,
    details,
    requestId: bodyRequestId ?? requestId,
  })
}

export type ListResult<TItem> = {
  data: TItem[]
  meta: ListMeta
}

export function createHttp(options: ApiClientOptions) {
  const doFetch = options.fetch ?? globalThis.fetch.bind(globalThis)

  async function send(input: RequestInput<unknown>): Promise<Response> {
    const headers: Record<string, string> = {}
    if (input.body !== undefined) headers['Content-Type'] = 'application/json'

    if (input.auth !== false) {
      const token = options.getToken?.()
      if (token) headers.Authorization = `${AUTH_SCHEME} ${token}`
    }

    let response: Response
    try {
      response = await doFetch(buildUrl(options.baseUrl, input.path, input.query), {
        method: input.method,
        headers,
        body: input.body === undefined ? undefined : JSON.stringify(input.body),
      })
    } catch (cause) {
      throw new ApiClientError({
        code: CLIENT_ERROR_CODES.NETWORK_ERROR,
        message: 'No se ha podido contactar con el servidor. Comprueba tu conexión.',
        cause,
      })
    }

    if (!response.ok) {
      const error = await toApiError(response)
      if (error.isUnauthenticated) options.onUnauthenticated?.()
      throw error
    }

    return response
  }

  /**
   * La respuesta se valida contra el schema del contrato antes de entregarla.
   * Cuesta un parse por petición y a cambio un cambio incompatible en la API
   * salta aquí, con el campo concreto, en lugar de reventar tres componentes
   * más abajo con un `undefined`.
   */
  async function parseData<TData>(response: Response, schema: z.ZodType<TData>): Promise<TData> {
    const envelope = z.object({ data: schema })
    const parsed = envelope.safeParse(await response.json())

    if (!parsed.success) {
      throw new ApiClientError({
        code: CLIENT_ERROR_CODES.INVALID_RESPONSE,
        message: 'La respuesta de la API no encaja con el contrato.',
        status: response.status,
        cause: parsed.error,
      })
    }
    return parsed.data.data
  }

  return {
    async request<TData>(
      input: RequestInput<TData> & { schema: z.ZodType<TData> },
    ): Promise<TData> {
      return parseData(await send(input), input.schema)
    },

    async requestList<TItem>(
      input: RequestInput<TItem> & { schema: z.ZodType<TItem> },
    ): Promise<ListResult<TItem>> {
      const response = await send(input)
      const envelope = z.object({ data: z.array(input.schema), meta: listMetaSchema })
      const parsed = envelope.safeParse(await response.json())

      if (!parsed.success) {
        throw new ApiClientError({
          code: CLIENT_ERROR_CODES.INVALID_RESPONSE,
          message: 'El listado devuelto por la API no encaja con el contrato.',
          status: response.status,
          cause: parsed.error,
        })
      }
      return parsed.data
    },

    /** Para los 204: no hay cuerpo que validar. */
    async requestEmpty(input: Omit<RequestInput<never>, 'schema'>): Promise<void> {
      await send(input)
    },
  }
}

export type Http = ReturnType<typeof createHttp>
