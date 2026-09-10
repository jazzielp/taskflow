/**
 * @taskflow/api-client
 *
 * Único camino por el que web y mobile hablan con la API. Depende de
 * @taskflow/contracts y @taskflow/config, nunca de la base de datos ni de
 * ficheros internos de apps/api.
 */
export * from './client'
export * from './errors'
export type { ApiClientOptions, ListResult, QueryParams } from './http'
