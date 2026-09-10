/**
 * @taskflow/contracts
 *
 * Contratos compartidos entre API, Web y Mobile:
 *  - Schemas de Zod para validar TODA entrada externa.
 *  - Schemas y tipos de los DTOs que devuelve la API.
 *  - Códigos de error estables.
 *
 * Este paquete solo depende de Zod. No conoce Express, React ni Prisma.
 */
export * from './auth'
export * from './common'
export * from './openapi'
export * from './projects'
export * from './tasks'
export * from './users'
