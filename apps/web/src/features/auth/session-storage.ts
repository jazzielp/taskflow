import type { UserDto } from '@taskflow/contracts'

/**
 * Persistencia de la sesión en el navegador.
 *
 * Se usa `localStorage` para que la sesión sobreviva a recargar la página y a
 * cerrar la pestaña. Es visible desde JavaScript, así que un XSS podría leer el
 * token: la defensa real es que el token caduca (`expiresIn`) y que la API
 * autoriza cada petición por su cuenta. Guardar el token en una cookie
 * `httpOnly` sería más seguro, pero exige que lo emita el backend como cookie,
 * y hoy la API lo devuelve en el cuerpo.
 *
 * En mobile este módulo se sustituye por SecureStore; el resto del código de
 * sesión no cambia.
 */
const TOKEN_KEY = 'taskflow.accessToken'
const USER_KEY = 'taskflow.user'

export type StoredSession = {
  accessToken: string
  user: UserDto
}

export function readSession(): StoredSession | null {
  try {
    const accessToken = localStorage.getItem(TOKEN_KEY)
    const rawUser = localStorage.getItem(USER_KEY)
    if (!accessToken || !rawUser) return null

    return { accessToken, user: JSON.parse(rawUser) as UserDto }
  } catch {
    // Modo privado, almacenamiento lleno o JSON corrupto: se trata como
    // "no hay sesión" en lugar de tumbar el arranque de la aplicación.
    return null
  }
}

export function writeSession(session: StoredSession): void {
  try {
    localStorage.setItem(TOKEN_KEY, session.accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(session.user))
  } catch {
    // Sin persistencia la sesión dura lo que dure la pestaña. Es degradado,
    // no roto.
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {
    // Nada que limpiar.
  }
}
