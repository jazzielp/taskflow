import { createApiClient } from '@taskflow/api-client'

import { clearSession, readSession } from '../features/auth/session-storage'

/**
 * Instancia única del cliente de API para toda la aplicación web.
 *
 * El token se lee del almacenamiento en cada petición en lugar de capturarse al
 * crear el cliente: así un login o un logout tienen efecto inmediato sin
 * reconstruir nada.
 */
export const api = createApiClient({
  baseUrl: import.meta.env.VITE_API_URL,
  getToken: () => readSession()?.accessToken ?? null,
  onUnauthenticated: () => {
    // El token ya no vale (caducado o revocado). Se limpia y se recarga para
    // que el router vuelva a evaluar la sesión y mande a /login.
    clearSession()
    if (window.location.pathname !== '/login') window.location.assign('/login')
  },
})
