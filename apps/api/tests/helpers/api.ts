import { createApp } from '../../src/app'

/**
 * La aplicación se construye una vez y se reutiliza en toda la batería.
 * Supertest lanza las peticiones directamente contra ella, sin abrir ningún
 * puerto real: por eso `createApp` vive separado de `server.ts`.
 */
export const app = createApp()
